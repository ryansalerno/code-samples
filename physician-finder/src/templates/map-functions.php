<?php

//======================================================================
// This is actually in our enqueue.php file with all the other rules
// but is excerpted here for anyone bothering to follow along
//======================================================================
function zen_enqueues(){
	$ver = '1.0'; // bump this number as necessary for cache busting
	if ($_SERVER['HTTP_HOST'] === 'localhost'){$ver = NULL;}

	if (is_page_template('template-map.php')){
		wp_register_script('physician-finder', get_template_directory_uri() . '/lib/js/map.min.js', array(), $ver, true);
		$map_helpers = array(
			'siteurl' => get_template_directory_uri(),
			'physician_json' => '/src/physicians.json',
			'specialty' => isset($_REQUEST['specialty']) ? esc_attr($_REQUEST['specialty']) : 'all',
		);
		wp_localize_script('physician-finder', 'map_helpers', $map_helpers);
		wp_enqueue_script('physician-finder');
		wp_enqueue_script('google-maps', 'https://maps.googleapis.com/maps/api/js?v=3&key='.google_api_key.'&callback=initMap', array('physician-finder'), '3', true);
	}
}
add_action('wp_enqueue_scripts', 'zen_enqueues');

//======================================================================
// Google Maps APIs aren't free anymore
//======================================================================
// our key is defined in wp-config so it's early and everywhere
add_action('acf/init', function(){
	acf_update_setting('google_api_key', google_api_key);
});

//======================================================================
// Do things whenever something changes on a physician
//======================================================================
function sk_do_physician_things($post_id, $post, $is_update){
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) { return false; }
	if ($post->post_type !== 'physician') { return false; }

	// regenerate our static GeoJSON cache
	sk_update_physician_geojson();

	sk_set_physician_state($post_id);
}
add_action('save_post', 'sk_do_physician_things', 100, 3);

// actually build the GeoJSON from entries in the database
function sk_update_physician_geojson(){
	// init
	$docs = array();

	// get 'em
	$physicians = get_posts(array('numberposts' => -1, 'post_type' => 'physician'));

	// now we need to massage (and fetch) the underlying data
	foreach ($physicians as $physician){
		// this is the most important thing
		$longlat = sk_get_coords($physician->ID);
		// bail as early as possible if we don't have actionable location data
		if (!$longlat){continue;}

		// we'll also pass along some arbitrary properties (note that this is for display AND search)
		$props = $_specialties = array();

		// name seems reasonable
		$props['name'] = $physician->post_title;
		// not ideal...
		// $props['address'] = sk_hopefully_format_address($physician->ID);

		// get specialties
		$specialties = get_the_terms($physician->ID, 'specialty');
		foreach ((array)$specialties as $specialty){
			if (!$specialty){ continue; }
			$_specialties[] = trim(esc_html($specialty->name));
		}
		sort($_specialties); // why not?
		$props['specialties'] = $_specialties;

		// finally, some fields that can all be handled the same
		$fields = array('state');
		foreach($fields as $field){
			$props[$field] = get_post_meta($physician->ID, $field, true);
		}

		// we did it! now make it look like GeoJSON
		$docs[] = array(
			'type' => 'Feature',
			'id' => $physician->ID,
			'geometry' => array(
				'type' => 'Point',
				'coordinates' => $longlat
			),
			'properties' => $props,
		);
	}

	// and write the thing so we can pull it in nice and easy like
	file_put_contents(dirname(__DIR__) . '/physicians.json', json_encode(array('type' => 'FeatureCollection', 'features' => $docs), JSON_NUMERIC_CHECK));
}

function sk_get_coords($id){
	$location = get_post_meta($id, 'location', true);

	if (!$location || !is_array($location) || !isset($location['lat']) || !isset($location['lng'])){ return false; }

	return array($location['lng'], $location['lat']);
}

function sk_hopefully_format_address($id){
	$location = get_post_meta($id, 'location', true);

	if (!$location || !is_array($location) || !isset($location['address'])){ return false; }

	$address = str_replace(', USA', '', $location['address']);

	// we want to keep the last comma, but split at the second-to-last comma...
	$keep = strrpos($address, ', ');
	$split = strrpos(substr($address, 0, $keep), ', ');

	if ($split){
		// now we want to break at every other comma
		$street_address = str_replace(', ', '<br />', substr($address, 0, $split));
		$address = $street_address.'<br />'.substr($address, $split + 2); // +2 to remove the ", " that's included from strrpos
	}

	return $address;
}

function sk_set_physician_state($id){
	$coords = sk_get_coords($id);

	if (!$coords){ return false; }

	$results = google_reverse_geocode($coords, 'administrative_area_level_1');

	// this is dumb
	if (!$results || !isset($results[0]['address_components']) || !isset($results[0]['address_components'][0]) || !isset($results[0]['address_components'][0]['long_name'])){ return false; }

	return update_post_meta($id, 'state', sanitize_text_field($results[0]['address_components'][0]['long_name']));
}

function google_reverse_geocode($lnglat, $type = ''){
	if ($type){ $type = '&result_type='.$type; }

	$response = wp_remote_get('https://maps.googleapis.com/maps/api/geocode/json?latlng='.$lnglat[1].','.$lnglat[0].$type.'&key='.google_api_key);

	if (is_wp_error($response) || !is_array($response) || !isset($response['body'])){ return false; }

	$results = json_decode($response['body'], 1);

	if (!isset($results['results']) || !$results['results'][0]){ return false; }

	return $results['results'];
}
