// 		var ab_slider = new comparator($(this));
// 		// trigger this on waypoints() or inview() or whatever
// 		button.addEventListener('click', function() {
// 			ab_slider.autoplay();
// 		});
document.addEventListener('DOMContentLoaded', function() {
	var comparators = document.querySelectorAll('.comparator');

	for (var i = 0; i < comparators.length; i++) {
		new comparator(comparators[i]);
	}
});

function comparator(container) {
	this.container = container;
	this.sets = container.nextElementSibling;
	this.dragger = container.querySelector('.handle');
	this.resizer = container.querySelector('.resize');
	this.setup();
}

comparator.prototype = {
	setup: function() {
		var self = this;

		this.dragger.addEventListener('mouseenter', function(e) {
			self.dragstart(e);
		});
		this.dragger.addEventListener('touchstart', function(e) {
			self.dragstart(e);
		});

		function dragremove() {
			self.dragger.classList.remove('draggable');
		}

		this.container.addEventListener('mouseleave', dragremove);
		this.container.addEventListener('touchend', dragremove);
		this.container.addEventListener('touchcancel', dragremove);

		this.sets.addEventListener('click', function(e) {
			self.nav(e);
		});
		this.sets.children[0].classList.add('active');
	},

	nav: function(e) {
		if (e.target.nodeName !== 'IMG') { return; }

		var prev = this.sets.querySelector('.active'),
			li = e.target.parentNode;
		if (prev){ prev.classList.remove('active'); }

		li.classList.add('active');

		this.container.firstElementChild.srcset = li.getAttribute('data-before');
		this.resizer.setAttribute('data-bg-srcset', li.getAttribute('data-after'));
		if (this.resizer.bg_srcset && bgs_instances && bgs_instances.hasOwnProperty(this.resizer.bg_srcset)){
			bgs_instances[this.resizer.bg_srcset].setup();
		}
	},

	dragstart: function(e) {
		var self = this;

		this.dragger.classList.add('draggable');

		// check if it's a mouse or touch event and pass along the correct value
		var startX = e.pageX ? e.pageX : e.originalEvent.touches[0].pageX;

		// get the initial position
		var dragWidth = this.dragger.getBoundingClientRect().width,
			posX = this.dragger.getBoundingClientRect().left + window.pageXOffset + dragWidth - startX,
			containerOffset = this.container.getBoundingClientRect().left + window.pageXOffset,
			containerWidth = this.container.getBoundingClientRect().width;

		// set limits
		minLeft = containerOffset + 26;
		maxLeft = containerOffset + containerWidth - dragWidth - 26;

		function dragcalc(e){
			// check if it's a mouse or touch event and pass along the correct value
			var moveX = e.pageX ? e.pageX : e.originalEvent.touches[0].pageX;

			leftValue = moveX + posX - dragWidth;

			// stay within limits
			if (leftValue < minLeft) {
				leftValue = minLeft;
			} else if (leftValue > maxLeft) {
				leftValue = maxLeft;
			}

			// translate the handle's left value to masked divs width
			widthValue = (leftValue + dragWidth / 2 - containerOffset) * 100 / containerWidth;

			self.do_drag(widthValue);
		}

		// calculate the dragging distance on mousemove
		// (using container instead of dragger because staying in bounds of the handle is annoying)
		this.container.addEventListener('mousemove', dragcalc);
		this.container.addEventListener('touchmove', dragcalc);
	},

	do_drag: function(to) {
		// Set the new values for the slider and the handle.
		this.dragger.style.left = to + '%';
		this.resizer.style.maxWidth = to + '%';
	},

	autoplay: function() {
		var self = this;
		this.container.classList.add('triggered');
		this.do_drag(100);
		setTimeout(function() {
			self.container.classList.remove('triggered');
		}, 2500);
		// just above the 2s animation set in CSS
	}
};
