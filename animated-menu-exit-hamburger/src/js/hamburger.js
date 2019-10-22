var menu_anim = anime.timeline({
	autoplay: false,
	duration: 666, // \m/
	easing: 'easeInOutCubic'
});

menu_anim.add({
	targets: '#hb_ex',
	d: [{
		value: 'M19.2,0 58,38.7 96.7,0 108,11.3 58,61.3 8,11.3z M58,39 58,39 58,54 58,54z M8,88.7 58,38.7 108,88.7 96.7,100 58,61.3 19.2,100z'
	}],
	offset: 0
}).add({
	targets: '#hb_me',
	d: [{
		value: 'M8,87 8,23 33,23 58,23 83,23 108,23 108,85 94,85 94,39 66.5,39 66.5,82 52.5,82 52.5,39 22,39 22,87z'
	}],
	offset: 0
}).add({
	targets: '#hb1',
	rotate: [{
		value: '-90deg'
	}],
	offset: 0
}).add({
	targets: '#hb_ni',
	d: [{
		value: 'M8,80 8,20 22,20 22,42 94,42 94,20 108,20 108,80 94,80 94,58 22,58 22,80z'
	}],
	offset: 0
}).add({
	targets: '#hb3',
	rotate: [{
		value: '90deg'
	}],
	offset: 0
}).add({
	targets: '#hb_ut',
	d: [{
		value: 'M18,8 58,8 Q58,94 58,95 T58,8 M58,8 97,8'
	}],
	offset: 0
});

document.getElementById('nav-hamburger').onchange = function(){
	menu_anim.play();
	if(menu_anim.completed){
		menu_anim.reverse();
	}
}
