<?php

//======================================================================
// ACF + JSON = ZOMG
//======================================================================
add_filter('acf/settings/save_json', function($path) {
	return dirname(__DIR__) . '/acf-fields';
});
add_filter('acf/settings/load_json', function($paths) {
	unset($paths[0]);
	$paths[] = dirname(__DIR__) . '/acf-fields';
	return $paths;
});

//======================================================================
// ACF should be searchable
//======================================================================
//http://adambalee.com/search-wordpress-by-custom-fields-without-a-plugin/
// Step 1: make postmeta data available by JOINing the tables
function cf_search_join( $join ) {
	global $wpdb;
	if ( ! is_admin() && is_search() && ! empty( $_GET['s'] ) ) {
		$join .= 'LEFT JOIN ' . $wpdb->postmeta . ' ON ' . $wpdb->posts . '.ID = ' . $wpdb->postmeta . '.post_id ';
	}
	return $join;
}
// Step 2: tell the search query to also check meta_values
function cf_search_where( $where ) {
	global $wpdb;
	if ( ! is_admin() && is_search() && ! empty( $_GET['s'] ) ) {
		$where = preg_replace(
			'/\(\s*' . $wpdb->posts . ".post_title\s+LIKE\s*(\'[^\']+\')\s*\)/",
			'(' . $wpdb->posts . ".post_title LIKE $1) OR (" . $wpdb->postmeta . ".meta_value LIKE $1)", $where );
	}
	return $where;
}
// Step 3: prevent duplicates
function cf_search_distinct( $where ) {
	if ( ! is_admin() && is_search() && ! empty( $_GET['s'] ) ) {
		return 'DISTINCT';
	}
	return $where;
}
add_filter( 'posts_join', 'cf_search_join' );
add_filter( 'posts_where', 'cf_search_where' );
add_filter( 'posts_distinct', 'cf_search_distinct' );

//======================================================================
// ACF template helpers
//======================================================================
function mtvg_section_classes($_classes = array()){
	$classes = array('section');
	$classes[] = str_replace('_', '-', get_row_layout());

	if ($_classes){
		$classes = array_merge($classes, (array)$_classes);
	}

	$bg = get_sub_field('background');
	if ($bg && $bg !== 'white'){
		$classes[] = 'bg-'.$bg;
	}

	return $classes;
}

function mtvg_module_intro(){
	$content = '';

	if (get_sub_field('title')){
		$content .= '<h2 class="h1 section-header">'.esc_html(get_sub_field('title')).'</h2>';
	}

	if (get_sub_field('intro')){
		$content .= '<div class="section-intro post-content text-center less-wide">'.apply_filters('the_content', get_sub_field('intro')).'</div>';
	}

	if ($btn = zen_acf_link(get_sub_field('cta'), 'button')){
		$content .= '<p class="text-center">'.$btn.'</p>';
	}

	return $content;
}

function zen_acf_link($link, $classes = ''){
	if (!isset($link['url']) || !$link['url'] || !isset($link['title']) || !$link['title']){ return; }

	$atts = '';
	if (isset($link['target']) && $link['target']){
		$atts .= ' target="'.esc_attr($link['target']).'" rel="noopener"';
	}

	if ($classes){
		$atts .= ' class="'.$classes.'"';
	}

	return '<a href="'.$link['url'].'"'.$atts.'>'.trim(esc_html($link['title'])).'</a>';
}

//======================================================================
// Trucks trucks trucks
//======================================================================
function all_mobile_units_quickselect_maker(){
	$select = $options = '';

	$args = array(
		'post_type' => 'mobile-unit',
		'post_status' => 'publish',
		'posts_per_page' => 128,
		'orderby' => 'title',
		'no_found_rows' => true,
		'update_post_meta_cache' => false,
		'update_post_term_cache' => false,
	);
	$trucks = new WP_Query($args);

	if (!$trucks->have_posts()){ return; }

	$this_page_id = get_queried_object_id();

	foreach ($trucks->posts as $truck){
		$selected = '';
		if ($this_page_id === $truck->ID){
			$selected = ' selected';
		}

		$options .= '<option value="'.get_permalink($truck->ID).'"'.$selected.'>'.$truck->post_title.'</option>';
	}

	if ($options){
		$select = '<form method="post" class="muqs">'.
					'<label for="mobile-unit-quickselect" class="sr-only">Jump to Mobile Unit Specs for:</label>'.
					'<select id="mobile-unit-quickselect" name="muqs" autocomplete="off">'.
						'<option value="">Unit Specs</option>'.
						$options.
					'</select>'.
					'<button type="submit">Go</button>'.
				'</form>';
	}

	return $select;
}

// probably our quickselect will be only used with JS, but let's make it work without anyway!
add_action('after_setup_theme', function(){
	if (isset($_POST['muqs']) && ($url = esc_url($_POST['muqs']))){
		wp_safe_redirect($url);
		exit;
	}
});

// sort our archive by title (so newer, higher numbered trucks are at the top)
add_action('pre_get_posts', function($query) {
	if (!is_admin() && $query->is_main_query() && (is_post_type_archive('mobile-unit') || is_tax(array('feature')))){
		$query->set('orderby', 'title');
	}
});

//======================================================================
// Truck page jump links
//======================================================================
// shove defined Mobile Units into a select called "Applies To"
// (this should maybe be a field type instead, but...)
function mtvg_get_all_sub_units_for_acf($field) {
	global $post;

	if (!$post || !isset($post->ID) || !isset($post->post_type) || $post->post_type !== 'mobile-unit'){ return $field; }

	$unit_count = get_post_meta($post->ID, 'units', true);
	for ($i=0; $i < $unit_count; $i++) {
		$unit_title = esc_html(get_post_meta($post->ID, 'units_'.$i.'_title', true));
		if ($unit_title){
			$field['choices'][$unit_title] = $unit_title;
		}
	}
	return $field;
}
// NOTE: we're also queueing up a hacky display override in the admin with css at enqueue.php#L41
add_filter('acf/load_field/name=applies_to', 'mtvg_get_all_sub_units_for_acf');

// these are the modules that ought to have applies_to set on them and warrant inclusion in our jump links
// NOTE: they'll end up on the page in the order defined in this array
function mtvg_jump_link_module_names(){
	return array(
		'mobile_unit_specs' => 'Specs',
		'image_grid' => 'Photos',
	);
}

// jump links need links to jump to
// let's do them here so they're in one place and changing them is [a little] less fragile
function mtvg_jump_link_ids($unit_slug, $module_name){
	$rename = mtvg_jump_link_module_names();

	if (isset($rename[$module_name])){
		$module_name = strtolower($rename[$module_name]);
	}

	// we should expect both of these to be already sanitized, buuuut....
	return sanitize_title_with_dashes($unit_slug.'-'.$module_name);
}

// look up relevant modules on the page, and create jump links to them as appropriate
function mtvg_mobile_unit_jump_links($this_unit){
	$links = '';

	$modules_for_inclusion = mtvg_jump_link_module_names();

	// this function is called inside a loop for each Unit, but the modules on the page don't change between calls
	// so we want to cache the list of modules in memory (even though WP probably caches the query for us)
	// and more than that, let's also cache the applies_to lookups and resultant map so it only happens once
	$store = acf_get_store('jump_link_map');
	if (!$store){
		// presumably our first call, so set some data so the next check doesn't fail
		$this_id = get_queried_object_id();
		$modules = get_post_meta($this_id, 'modules', true);

		$map = array();

		foreach (array_keys($modules_for_inclusion) as $module){
			$positions = array_keys($modules, $module);
			foreach ($positions as $pos){
				$applies_to = get_post_meta($this_id, 'modules_'.$pos.'_applies_to', true);
				if (!$applies_to){ continue; }

				@$map[$applies_to][] = $module;
			}
		}

		if ($map){
			acf_register_store('jump_link_map', array('map' => $map));
		}
	} else {
		$map = $store->get('map');
	}

	if (!isset($map[$this_unit])){ return; }

	foreach ($map[$this_unit] as $module_name){
		$slug = mtvg_jump_link_ids($this_unit, $module_name);
		$links .= ' <a href="#'.esc_attr($slug).'">'.$modules_for_inclusion[$module_name].'</a>';
	}

	if ($links){
		return '<p class="jump-links">Jump to:'.$links.'</p>';
	}
}

//======================================================================
// Archive page id messiness
//======================================================================
function mtvg_archive_page_id($post_type){
	$args = array(
		'post_type' => 'page',
		'post_status' => 'publish',
		'limit' => 1,
		'fields' => 'ids',
		'meta_key' => '_wp_page_template',
		'meta_value' => 'archive-'.$post_type.'.php',
		'no_found_rows' => true,
		'update_post_meta_cache' => false,
		'update_post_term_cache' => false,
	);
	$pages = new WP_Query($args);

	if ($pages->have_posts()){
		return $pages->posts[0];
	}
}

add_filter('template_include', function($template){
	if (is_tax(array('feature'))){
		return locate_template('archive-mobile-unit.php');
	}
	return $template;
});
