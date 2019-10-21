<?php

$scenes = array();

foreach ((array)get_sub_field('scenarios') as $scenario){
	$scene = '';

	if (isset($scenario['title'])){
		$scene .= '<h3 class="alt-color">'.esc_html($scenario['title']).'</h3>';
	}

	if (isset($scenario['content'])){
		$scene .= '<div class="post-content">'.wp_kses($scenario['content'], 'post').'</div>';
	}

	if ($scene){
		$scenes[] = $scene;
	}
}

if (count($scenes) === 4){ // since our animations are hard-coded and expecting certain scenes, but our content is user-entered, this is a minor and incomplete sanity check
	wp_enqueue_script('scrolling-map');

	$content = '<ul class="no-bullets scenario-holder"><li></li><li>'.implode('</li><li>', $scenes).'</li></ul>';
	echo '<section class="section glennopolis"><div class="city-holder"><figure id="glennopolis" class="m-active">'.file_get_contents(get_template_directory().'/lib/svg/glennopolis.svg').'</figure></div>'.$content.'</section>';
}

?>
