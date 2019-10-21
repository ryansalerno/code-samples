document.addEventListener('DOMContentLoaded', function(){
	// there could be several of this module on a page, so handle them individually
	var tabholder = document.querySelectorAll('.vertical-tabs'),
		tabholder_count = tabholder.length;

	// everything we need can be called with a simple function here
	setup_all_tabs();

	// our setup bails on small screens, so we need to run it again on resize
	var tabular_dude = debounce(function(evt){
		setup_all_tabs();
	}, 100);
	window.addEventListener('resize', tabular_dude, false);

	//=========================================================================
	// Maybe Setup
	//=========================================================================
	// we're waiting for resize events, so make sure we don't over-do anything
	function setup_all_tabs(){
		// we don't want to do this on narrow viewports, so bail immediately
		if (window.innerWidth < 800){ return; }

		for (var i = 0; i < tabholder_count; i++) {
			// also, we don't need to do this more than once, so bail early if we've already done it
			if (!tabholder[i].classList.contains('js')){
				// actually set things up
				tabs_setup(tabholder[i]);
			}
		}
	}

	//=========================================================================
	// Actually Setup: take an instance of the module and do what needs doing
	//=========================================================================
	function tabs_setup(parent){
		// change styles, and give ourselves the hook to not set up twice
		parent.classList.add('js');

		// get the parent element of our tabs
		var tab_content = parent.querySelector('.tabs-content');
		if (!tab_content){ return; }

		// get our tabs
		var tabs = tab_content.children;
		if (!tabs.length){ return; }

		// create our side navigation
		// (we're doing this in JS because it doesn't serve a purpose otherwise)
		// (and putting it in the template and just hiding it would be lazy)
		var tab_nav = make_all_tab_nav_items(tabs);

		// now, make a new parent to hold the previous tabs content and our new tabs nav
		var new_parent = document.createElement('div');
		new_parent.classList.add('horiz'); // IE11 doesn't add multiple classes at once
		new_parent.classList.add('x2');
		new_parent.classList.add('no-padding');
		new_parent.appendChild(tab_nav);
		tab_content.parentNode.insertBefore(new_parent, tab_content);
		new_parent.appendChild(tab_content);

		// we're all done!

		// now just make the first tab active...
		tabs[0].classList.add('active');
		// ...and lazy-load its image
		display_tab_img(tabs[0]);
	}

	//=========================================================================
	// Create tab nav from tabs
	//=========================================================================
	function make_all_tab_nav_items(tabs){
		// we need a new parent UL...
		var nav = document.createElement('ul'),
			li; // ...and a handful of LIs (to be created just below)

		nav.classList.add('tabs-nav');
		nav.classList.add('no-bullets');

		for (var i = 0; i < tabs.length; i++) {
			// create the LI contents as many times as necessary...
			li = make_tab_nav_item(tabs[i]);
			// ...and add them to our parent UL
			nav.appendChild(li);
		}

		// make the first one active
		nav.firstElementChild.classList.add('active');

		// and add our click handler (to the whole group, so there's only one)
		nav.addEventListener('click', change_tab);

		// we're done!

		// return the element directly so it gets stored as the variable above
		return nav;
	}

	//=========================================================================
	// Create an individual tab nav from an individual tab
	//=========================================================================
	function make_tab_nav_item(tab){
		// guess what
		var li = document.createElement('li');

		// .moving-caret should trigger on the whole element
		li.classList.add('fake-button');

		// the title is the main element that moves over, so clone it...
		var title = tab.querySelector('h3').cloneNode(true);
		// ...add our anchor-looking class...
		title.classList.add('moving-caret');
		title.classList.add('h5');
		// ...and toss it into the parent
		li.appendChild(title);

		// maybe there's a nicely excerpted summary here?
		var excerpt = tab.getAttribute('data-excerpt');
		if (excerpt){
			// oh, goody, there is
			var p = document.createElement('p');
			// we base64encoded it because punctuation
			p.innerHTML = atob(excerpt);
			// add it as well
			li.appendChild(p);
		}

		// that's it! return the element so it can have a useful life
		return li;
	}

	//=========================================================================
	// Javascript is for interactivity
	//=========================================================================
	function change_tab(evt){
		// event delegation is fun
		var li = evt.target;
		while (li.nodeName !== 'LI') {
			// make sure we haven't somehow gone up too far...
			if (li.nodeName === 'UL'){ return false; }
			li = li.parentNode;
		}

		// bail if the click was on an already active nav
		if (li.classList.contains('active')){ return false; }

		// may as well cache this
		var ul = li.parentNode;

		// 1. remove old '.active' things
		// 2. make the clicked thing '.active'
		atomically_add_active_class(li);

		// figure out which one was clicked...
		var index = Array.prototype.indexOf.call(ul.children, li);
		if (index > -1){
			// ...so we can activate the corresponding tab
			var tab = ul.nextElementSibling.children[index];

			if (tab){
				// lazy-load its image
				display_tab_img(tab);
				// and do the 'active' class dance over there as well
				atomically_add_active_class(tab);
			}
		}
	}

	//=========================================================================
	// Don't do things twice when you can write a function
	//=========================================================================
	function atomically_add_active_class(el){
		// find the old thing
		var prev = el.parentNode.querySelector('.active');
		if (prev){
			// remove it if it exists
			prev.classList.remove('active');
		}

		// and activate the new thing
		el.classList.add('active');
	}

	//=========================================================================
	// Don't load images until you need them
	//=========================================================================
	// and we don't want them loading on mobile at all, so keep it in JS
	function display_tab_img(tab){
		// grab the image URL from the template
		var img = tab.querySelector('figure[data-bg]');

		// only do this once (even though it wouldn't matter if it repeated)
		if (img && !img.style.backgroundImage){
			// set it and hope it loads eventually
			img.style.backgroundImage = 'url('+img.getAttribute('data-bg')+')';
		}
	}
});
