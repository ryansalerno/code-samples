<?php

$page_id = get_queried_object_id();
$hero = get_post_meta($page_id, 'hero_type', true);

// bail early if there's nothing to do
if (!$hero || $hero === 'none'){
	// because of the fixed transparent nav, we need to add some space to the top of pages that don't have heroes helpfully pushing content down
	// ideally, we would add a class to MAIN and not use an empty element here, but the logic for doing that is more complicated than doing it correctly is worth....
	echo '<div class="never-meet-your-heroes"></div>';
	return;
}

// set-up
$image = get_post_meta($page_id, 'hero_image', true);
$video = get_post_meta($page_id, 'hero_video', true);

// getting the right image URL for the job
$image_size = 'hero';
if ($hero === 'big-zen'){$image_size = 'large';}

// build elements
$_hero = '';
if ($video && $image){
	$_hero = '<div class="videoholder"><video src="'.wp_get_attachment_url($video).'" poster="'.wp_get_attachment_image_url($image, $image_size).'" muted autoplay loop></video></div>';
} elseif ($image) {
	$_hero = wp_get_attachment_image($image, $image_size);
}

// overrides and wrappers and extras, based on which type of hero we have
if ($hero === 'big-zen'){
	$classes = array('content-width', 'big-zen');
	$_hero .= '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 35"><path id="big-zen" d="M0,9.5 0,9.5 0,26.5z M32.5,0 32.5,8 32.5,25.5 32.5,25.5 32.5,35 34.5,35 34.5,0z M63.5,0 63.5,9.5 63.5,9.5 63.5,13 63.5,13 63.5,21.5 63.5,21.5 63.5,25.5 63.5,25.5 63.5,35 65.5,35 65.5,0z M76,0 88.5,0 88.5,0z M77,35 77,35 90,35z"/></svg>';
} else {
	$classes = array('hero');

	// the basic hero has extra things that could apply
	if (get_post_meta($page_id, 'hero_fancy_text', true)){
		$_hero .= '<figure class="fancy-text less-wide">'.zen_inline_if_svg(get_post_meta($page_id, 'hero_fancy_text', true), 'large').'</figure>';
	}

	if (get_post_meta($page_id, 'pop_in_box', true)){
		$classes[] = 'has-pop-in';
		$_hero .= '<aside class="pop-in">'.wp_kses(get_post_meta($page_id, 'pop_in_box', true), 'post').'</aside>';
	}
}

echo '<div class="'.implode(' ', $classes).'">'.$_hero.'</div>';
