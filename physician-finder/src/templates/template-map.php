<?php
/*
 * Template Name: Physician Finder
 * Description: Complicated map fun instead of a hero image
 */
get_header();

// we don't want to filter what shows up in the template because we're using this as the master list in JS
// which means we can't have non-JS filtering of the list here, but...the map doesn't work without JS so that's already a much-lowered-bar that we're not handling
// we could open this up to PHP filtering, but we'd have to have JS reload the page, or duplicate the content, or set up some gnarly ajax action to get templated items, etc...
// $specialty = '';
// if(isset($_REQUEST['specialty']) && $_REQUEST['specialty']) {
// 	$specialty = str_replace('-', ' ', esc_attr($_REQUEST['specialty']));
// }

$physicians = get_posts(array('numberposts' => 512, 'post_type' => 'physician')); // (I know now that this should be a WP_Query() with 'no_found_rows')
$physicians_by_state = array();
foreach ($physicians as $physician){
	$state = get_post_meta($physician->ID, 'state', true);
	@$physicians_by_state[$state][$physician->ID] = array(
		'name' => esc_html($physician->post_title),
		'address' => wp_kses(sk_hopefully_format_address($physician->ID), array('br' => '')),
		'phone' => esc_html(get_post_meta($physician->ID, 'phone_number', true)),
		'extras' => wp_kses(wpautop(get_post_meta($physician->ID, 'additional_information', true)), 'post'),
	);
}
ksort($physicians_by_state);

$dl = '';
foreach ($physicians_by_state as $state => $docs){
	$dl .= '<dt class="h3">'.$state.'</dt>';
	foreach ($docs as $id => $data){
		$_formatted = '';

		if (isset($data['name']) && $data['name']){
			$_formatted .= '<h5>'.$data['name'].'</h5>';
		}

		if (isset($data['address']) && $data['address']){
			$_formatted .= '<p>'.$data['address'].'</p>';
		}

		if (isset($data['phone']) && $data['phone']){
			$_formatted .= '<p><a href="tel:'.preg_replace('/[^0-9]+/', '', $data['phone']).'">'.$data['phone'].'</a></p>';
		}

		if (isset($data['extras']) && $data['extras']){
			$_formatted .= '<p>'.$data['extras'].'</p>';
		}

		if ($_formatted){
			$_formatted = '<div>'.$_formatted.'</div>';

			$_specialties = array();
			$specialties = get_the_terms($id, 'specialty');
			foreach ((array)$specialties as $spec){
				if (!$spec){ continue; }
				$_specialties[$spec->slug] = trim(esc_html($spec->name));
			}

			$data_atts = ' data-id="'.$id.'"';
			if ($_specialties){
				asort($_specialties); // why not?

				$data_atts .= ' data-specialties=\''.json_encode(array_keys($_specialties)).'\'';

				$_formatted .= '<ul class="meta no-bullets"><li>'.implode('</li><li>', array_values($_specialties)).'</li></ul>';
			}

			$dl .= '<dd'.$data_atts.'>'.$_formatted.'</dd>';
		}
	}
}

if ( !post_password_required() ){
	if ( have_posts() ) while ( have_posts() ) : the_post(); ?>
		<?php get_template_part('templates/hero'); ?>

		<main class="site-main" role="main">
			<article class="map-holder">
				<div id="map" class="margins-off"></div>

				<aside id="no-results" class="hidden">
					<p>Sorry, no physicians found. Please try a broader search.</p>
				</aside>

				<section class="map-results">
					<form action="./" method="POST" id="map-filters" class="hidden">
						<label>Near Zipcode
							<input type="number" name="zip" />
						</label>
						<button type="submit">Find Physicians</button>
					</form>
					<dl id="map-listings"><?php echo $dl; ?></dl>
				</section>
			</article>

			<?php if (get_field('page_intro_text')): ?>
				<section class="content-width less-wide text-center">
					<?php the_field('page_intro_text'); ?>
				</section>
			<?php endif; ?>

			<?php if (have_rows('modules')) : ?>
				<?php while (have_rows('modules')) : the_row(); ?>
					<?php get_template_part('templates/module', get_row_layout()); ?>
				<?php endwhile; ?>
			<?php endif; ?>
		</main>

	<?php endwhile;
} else {
	echo get_the_password_form();
}

get_footer(); ?>
