<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<?php // use this wonderful thing: https://realfavicongenerator.net/ ?>
	<link rel="apple-touch-icon" sizes="180x180" href="<?php echo get_stylesheet_directory_uri(); ?>/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="<?php echo get_stylesheet_directory_uri(); ?>/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="<?php echo get_stylesheet_directory_uri(); ?>/favicon-16x16.png">
	<link rel="manifest" href="<?php echo get_stylesheet_directory_uri(); ?>/site.webmanifest">
	<link rel="mask-icon" href="<?php echo get_stylesheet_directory_uri(); ?>/safari-pinned-tab.svg" color="#ff6c2f">
	<link rel="shortcut icon" href="<?php echo get_stylesheet_directory_uri(); ?>/favicon.ico">
	<meta name="msapplication-config" content="<?php echo get_stylesheet_directory_uri(); ?>/browserconfig.xml">
	<meta name="theme-color" content="#ffffff">

	<?php
		wp_head();
		if ($extra_header_scripts = get_theme_mod( 'zen_additional_scripts_head' )){
			echo $extra_header_scripts;
		}
	?>
</head>

<body <?php body_class(); ?>>
	<script type="text/javascript">document.documentElement.className = 'js';</script>
	<header class="main" id="fixed-header">
		<div class="content-width horiz end">
			<a id="logo" href="<?php echo home_url(); ?>" rel="nofollow" itemscope itemtype="http://schema.org/Organization" title="<?php echo esc_attr(get_bloginfo('name')); ?>"><?php include(locate_template('lib/svg/zenman-logo.svg')); ?></a>

			<input id="nav-hamburger" class="hidden" type="checkbox" />
			<input id="search-toggle" class="toggler" type="checkbox" />

			<label class="toggler search-toggle" for="search-toggle"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="big icon stroked"><circle cx="6.25" cy="6.25" r="4.5" stroke-width="1.5"/><path d="M14.5,14.5L9.5,9.5" stroke-width="2"/></svg></label>
			<aside class="toggle-target header-search"><?php get_search_form(); ?></aside>

			<label class="hamburger horiz" for="nav-hamburger">
				<svg id="hb1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116 100"><path id="hb_me" d="M4,100 4,0 24,0 58,77 92,0 112,0 112,100 92,100 92,36 78,68 64,100 52,100 38,68 24,36 24,100z"/></svg>
				<svg id="hb2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116 100"><path id="hb_ex" d="M12,0 58,0 104,0 104,15 58,15 12,15z M12,39 104,39 104,54 12,54z M12,85 58,85 104,85 104,100 58,100 12,100z"/></svg>
				<svg id="hb3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116 100"><path id="hb_ni" d="M16,100 16,0 34,0 34,0 84,72 84,0 100,0 100,100 82,100 82,100 32,28 32,100z"/></svg>
				<svg id="hb4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116 100"><path id="hb_ut" d="M26.5,0 26.5,50 Q26.5,93 58,91 T89.5,50 M89.5,50 89.5,0"/></svg>
			</label>

			<?php
				$nav = array(
					'theme_location'  => 'header-menu',
					'container'       => 'nav',
					'container_class' => 'header-nav',
					'menu_class'      => 'menu margins-off',
					'depth'           => 2,
					'walker'          => new zen_nav_submenu_maker(true),
					'fallback_cb'     => false,
				);
				wp_nav_menu($nav);
			?>
		</div>
	</header>
