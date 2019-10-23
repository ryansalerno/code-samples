var img = document.createElement('img');
var srcset = ('sizes' in img);

walls = document.querySelectorAll('.tv-wall');

var tv_wall = function(el){
	// bail if no srcset support
	// (we could parse it ourselves and use a fallback src as appropriate, but links to images is fine for these old browsers)
	if (!srcset){ return; }

	// let CSS know we're going to use .spotlight and swap images around
	el.classList.add('js');

	// cache the elements we're going to operate on
	this.el = el;
	this.img = el.querySelector('img'); // .spotlight always comes first in source order
	this.caption = this.img.parentNode.nextElementSibling;

	// let's go
	this.init();
}

tv_wall.prototype = {
	init: function(){
		var that = this;

		this.el.addEventListener('click', function(evt){
			var i = evt.target;
			if (i.nodeName === 'A'){ i = i.firstElementChild; }
			if (i.nodeName !== 'IMG' || i == that.img){ return; }

			evt.preventDefault();

			that.go_to_camera_seven(i);
		});
	},
	go_to_camera_seven: function(clicked){
		var prev = this.el.querySelector('.active');
		if (prev){
			prev.classList.remove('active');
		}
		clicked.parentNode.classList.add('active');

		var newcap = (clicked.hasAttribute('data-caption')) ? atob(clicked.getAttribute('data-caption')) : '';
		this.caption.textContent = newcap;

		/*****
		Code Samples edit:

		WP gives us srcsets and multiple image sizes, but there's no point in storing a bunch of image assets here, so I've simplified the markup for the images and am only using one size....
		we'd want to really do this (which is why we tested for it first thing above):

		this.img.srcset = clicked.srcset;

		(this is cool because we get to display the larger sized spotlight image without doing any swapping because the browser will pick from srcset and make the distinction between thumb and larger for us)

		but for this demo, we're just going to do this:
		*****/
		this.img.src = clicked.src;
	}
};

for (var i = 0; i < walls.length; i++) {
	new tv_wall(walls[i]);
}
