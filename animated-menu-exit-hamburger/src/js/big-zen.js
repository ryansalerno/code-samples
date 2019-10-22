var bigZen = document.getElementById('big-zen');

if (bigZen){
	var zenReveal = anime({
		targets: bigZen,
		d: [{
			value: 'M0,9.5 16,9.5 0,26.5z M32.5,0 32.5,8 16.5,25.5 32.5,25.5 32.5,35 34.5,35 34.5,0z M63.5,0 63.5,9.5 45.5,9.5 45.5,13 62,13 62,21.5 45.5,21.5 45.5,25.5 63.5,25.5 63.5,35 65.5,35 65.5,0z M76,0 88.5,15.5 88.5,0z M77,35 77,19 90,35z'
		}],
		duration: 1250,
		delay: 3500,
		easing: [.66,0,.9,1.1]
	});
}
