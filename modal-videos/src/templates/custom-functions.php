<?php

//======================================================================
// ACF template helpers
//======================================================================
function bni_section_classes($_classes = array()){
	$classes = array('section');
	$classes[] = str_replace('_', '-', get_row_layout());

	if ($_classes){
		$classes = array_merge($classes, (array)$_classes);
	}

	$dark_enough_for_white_text = array('highlight', 'primary', 'secondary', 'gray-md', 'gray-lt');
	$bg = get_sub_field('background');
	if ($bg && $bg !== 'white'){
		$classes[] = 'bg-'.$bg;

		if (in_array($bg, $dark_enough_for_white_text)){
			$classes[] = 'light-colored-text';
		}
	}

	return $classes;
}

function bni_module_intro(){
	$content = '';

	if (get_sub_field('title')){
		$content .= '<h2 class="section-header">'.esc_html(get_sub_field('title')).'</h2>';
	}

	if (get_sub_field('intro')){
		$classes = 'section-intro post-content less-wide';
		if (get_row_index() === 1 && get_row_layout() === 'basic_content'){
			$classes .= ' alt-color';
		}
		$content .= '<div class="'.$classes.'">'.apply_filters('the_content', get_sub_field('intro')).'</div>';
	}

	// if ($btn = zen_acf_link(get_sub_field('cta'), 'button')){
	// 	$content .= '<p>'.$btn.'</p>';
	// }

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
// oEmbeds are easy, so let's make them complicated!
//======================================================================
// the intentionally terrible function names help (a little)
function ounembed($embed){
	preg_match('/src="(.+?)"/', $embed, $matches);
	if (isset($matches[1])){
		return $matches[1];
	}
	return '';
}
function deoembed_url_remaker($url){
	// https://www.youtube.com/embed/yRHwWGO_A48?feature=oembed
	if (strpos($url, 'youtube.com') !== false){
		return str_replace(array('embed/', '?feature=oembed'), array('watch?v=', ''), $url);
	}
	// https://player.vimeo.com/video/45105236?app_id=122963
	if (strpos($url, 'vimeo.com') !== false){
		preg_match('/video\/(\d+)\?/', $url, $id);
		if (isset($id[1])){ return $id[1]; }
	}
	return false;
}
function oembed_poster($url){
	// https://www.youtube.com/embed/yRHwWGO_A48?feature=oembed
	if (strpos($url, 'youtube.com') !== false){
		if ($id = strrchr($url, '/')){
			$id = substr(str_replace('?feature=oembed', '', $id), 1);
			$poster = 'https://i.ytimg.com/vi/'.$id.'/sddefault.jpg';
			$headers = @get_headers($poster);
			if (!$headers || strpos($headers[0], '404') !== false) {
				$poster = 'https://i.ytimg.com/vi/'.$id.'/hqdefault.jpg';
			}
			return $poster;
		}
	}
	// https://player.vimeo.com/video/45105236?app_id=122963
	if (strpos($url, 'vimeo.com') !== false){
		$json = file_get_contents('https://vimeo.com/api/oembed.json?width=800&url='.rawurlencode($url));
		if ($json){
			$response = json_decode($json);
			return $response->thumbnail_url;
		}
	}
	return false;
}
function clickable_oembed_linker_thing($link, $embed_url){
	return '<div class="videoholder clickable-embed"><a class="embed-content bg-img" style="background-image: url(\''.oembed_poster($embed_url).'\');" href="'.esc_url($link).'" data-oembed="'.$embed_url.'&autoplay=1"><figure class="play-button">'.zen_svg_icon('play-button', '').'</figure></a></div>';
}
function clickable_oembed_post_archive_thing($content){
	$embeds = get_media_embedded_in_content(apply_filters('the_content', $content));
	if (!$embeds){ return false; }
	foreach ($embeds as $embed){
		if (strpos($embed, 'youtube') || strpos($embed, 'vimeo')){
			break;
		}
	}
	$embed_url = ounembed($embed);
	return '<div class="videoholder clickable-embed"><div class="embed-content bg-img" style="background-image: url(\''.oembed_poster($embed_url).'\');" data-oembed="'.$embed_url.'&autoplay=1"><figure class="play-button">'.zen_svg_icon('play-button', '').'</figure></div></div>';
}
