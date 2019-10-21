<?php

$classes = bni_section_classes('text-center');
$content = bni_module_intro();

foreach ((array)get_sub_field('rows') as $row){
	if (!isset($row['image']) || !isset($row['content'])){ continue; }

	$back = $forth = '';

	if (isset($row['image']['type'])){
		if ($row['image']['type'] === 'video'){
			$embed_url = ounembed($row['image']['video']);
			$original_url = deoembed_url_remaker($embed_url);

			$img = clickable_oembed_linker_thing($original_url, $embed_url);
		} else if ($row['image']['type'] === 'image'){
			$img = '<figure>'.zen_inline_if_svg($row['image']['image'], 'large').'</figure>';
		}

		if (isset($img)){
			$back .= '<div class="back">'.$img.'</div>';
		}
	}

	if (isset($row['content']['title']) && $row['content']['title']){
		$forth .= '<h3>'.esc_html($row['content']['title']).'</h3>';
	}

	if (isset($row['content']['content'])){
		$forth .= '<div class="post-content">'.wp_kses($row['content']['content'], 'post').'</div>';
	}

	$forth .= zen_acf_link($row['content']['cta'], 'button');

	if ($back && $forth){
		$content .= '<div class="row">'.$back.'<div class="forth text-left">'.$forth.'</div></div>';
	}
}

if ($content){
	echo '<section class="'.implode(' ', $classes).'">'.
			'<div class="content-width">'.$content.'</div>'.
		'</section>';
}

?>
