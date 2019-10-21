document.addEventListener("DOMContentLoaded", function() {
	var play_buttons = document.querySelectorAll("[data-oembed]");
	for (var i = 0; i < play_buttons.length; i++) {
		play_buttons[i].addEventListener("click", function(evt) {
			if (window.innerWidth > 800) {
				video_lightbox(this);
				evt.preventDefault();
			}
		});
	}

	if (play_buttons.length) {
		var lightbox = document.createElement("div");
		lightbox.id = "lightbox";
		lightbox.classList.add("hidden");

		document.body.appendChild(lightbox);

		document.addEventListener("keyup", function(e) {
			if (!lightbox) return;
			if (lightbox.innerHTML !== "") {
				var k = e.which || e.keyCode || 0;
				switch (k) {
					case 27: // esc
					case 88: // x
					case 81: // q
					case 8: // backspace
						lightbox_close();
				}
			}
		});

		lightbox.addEventListener("click", function() {
			lightbox_close();
		});
	}

	function video_lightbox(el) {
		if (lightbox) {
			var videoholder = document.createElement('div'),
				iframe = document.createElement('iframe');

			iframe.src = el.getAttribute('data-oembed')+'&autoplay=1';

			videoholder.classList.add('videoholder');
			videoholder.appendChild(iframe);

			lightbox.innerHTML = "";
			lightbox.appendChild(videoholder);
			lightbox.classList.remove("hidden");
		}
	}

	function lightbox_close() {
		if (lightbox) {
			lightbox.classList.add("hidden");
			lightbox.innerHTML = "";
		}
	}
});
