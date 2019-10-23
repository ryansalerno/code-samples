<?php

$images = get_sub_field('gallery');
// $images = array_fill(0, 4, 114);
if (!$images){ return; }

$classes = mtvg_section_classes('text-center');
$content = mtvg_module_intro();

wp_enqueue_script('image-grid');

$gallery = array('<li class="spotlight"><figure><div class="videoholder"><img alt=""/></div><figcaption>Click any small image to view it here.</figcaption></figure></li>');
foreach ((array)$images as $image_id){
	// try to get a caption from: caption, title, alt tag (in that order)
	$caption = wp_get_attachment_caption($image_id);
	if (!$caption){
		$caption = get_the_title($image_id);
	}
	if (!$caption){
		$caption = get_post_meta($image_id, '_wp_attachment_iamge_alt', true);
	}

	$gallery[] = '<li><a href="'.wp_get_attachment_image_url($image_id, 'hero').'">'.wp_get_attachment_image($image_id, 'medium', false, array('data-caption' => base64_encode($caption))).'</a></li>';
}

switch (count($images)) {
	case 4:
	case 6:
	case 8:
		$gallery[] = '<li class="filler"></li>';
		break;
}

$content .= '<ul class="tv-wall no-bullets x'.count($images).'">'.implode('', $gallery).'</ul>';

echo '<section class="'.implode(' ', $classes).'">'.
		'<div class="content-width">'.$content.'</div>'.
	'</section>';

?>
