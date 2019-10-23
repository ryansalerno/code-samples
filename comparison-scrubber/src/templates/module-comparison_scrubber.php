<?php

wp_enqueue_script('scrubber');

$page_id = get_the_ID();
$prefix = get_query_var('prefix');

$comparison = $thumbs = '';

$images = array('thumb', 'before', 'after');
$sets = acf_repeater($page_id, $prefix.'sets', $images);
foreach ($sets as $set){
	if (count($set) === count($images)){
		// only set up the first one for immediate display
		if (!$comparison){
			$comparison .= '<div class="comparator margins-off" data-bg-srcset-measure>'.
								wp_get_attachment_image($set['before'], 'post-thumbnail').
								'<div class="resize" style="background-image: url('.wp_get_attachment_image_url($set['after'], 'medium').');" data-bg-srcset="'.wp_get_attachment_image_srcset($set['after'], 'post-thumbnail').'" data-bg-srcset-nomeasure></div>'.
								'<span class="handle"></span>'.
							'</div>';
		}

		$thumbs .= '<li data-before="'.wp_get_attachment_image_srcset($set['before'], 'post-thumbnail').'" data-after="'.wp_get_attachment_image_srcset($set['after'], 'post-thumbnail').'" title="View another comparison">'.wp_get_attachment_image($set['thumb'], 'thumbnail').'</li>';
	}

	// kill the nav if there's only one comparison
	if (count($sets) < 2){ $thumbs = ''; }
}

if ($comparison){
	$classes = array('section', 'content-width', 'comparison-scrubber');

	echo '<section class="'.implode(' ', $classes).'">';

	if ($title = get_post_meta($page_id, $prefix.'title', true)){
		echo '<h3 class="h1 section-header">'.trim(wp_kses($title, array('strong' => array()))).'</h3>';
	}

	echo $comparison;

	if ($thumbs){
		echo '<ul class="no-bullets horiz space-between margins-off comparison-sets">'.$thumbs.'</ul>';
	}

	echo '</section>';
}

?>
