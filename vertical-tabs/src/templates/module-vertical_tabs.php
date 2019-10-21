<?php

$content = $tabs = '';
$classes = array('section', 'vertical-tabs');

if (get_sub_field('title')){
	$content .= '<h2 class="section-header text-center">'.esc_html(get_sub_field('title')).'</h2>';
}

if (get_sub_field('intro')){
	$content .= '<div class="post-content less-wide">'.wp_kses(get_sub_field('intro'), 'post').'</div>';
}

foreach ((array)get_sub_field('tabs') as $tab){
	if (!isset($tab['preview']) || !isset($tab['full_content'])){ continue; }

	$_content = $excerpt = '';

	if (isset($tab['full_content']['image'])){
		$_content .= '<figure class="bg-img videoholder" data-bg="'.wp_get_attachment_image_url($tab['full_content']['image'], 'large').'"></figure>';
	}

	if (isset($tab['preview']['title'])){
		$_content .= '<h3 class="tab-title">';

		if (isset($tab['preview']['icon'])){
			$_content .= '<figure class="big icon">'.zen_inline_if_svg($tab['preview']['icon']).'</figure>';
		}

		$_content .= esc_html($tab['preview']['title']).'</h3>';
	}

	if (isset($tab['full_content']['content'])){
		$_content .= '<div class="post-content">'.wp_kses($tab['full_content']['content'], 'post').'</div>';
	}

	if (isset($tab['full_content']['cta'])){
		// template helper that takes care of checking/outputting all the right fields and settings
		$_content .= zen_acf_button($tab['full_content']['cta']);
	}

	if (isset($tab['preview']['excerpt'])){
		$excerpt = ' data-excerpt="'.base64_encode(esc_html($tab['preview']['excerpt'])).'"';
	}

	if ($_content){
		$tabs .= '<li class="tab"'.$excerpt.'>'.$_content.'</li>';
	}
}

if ($tabs){
	$content .= '<ul class="tabs-content no-bullets">'.$tabs.'</ul>';
}

if ($content){
	wp_enqueue_script('vertical-tabs');

	echo '<section class="'.implode(' ', $classes).'">'.
			'<div class="content-width">'.$content.'</div>'.
		'</section>';
}

?>
