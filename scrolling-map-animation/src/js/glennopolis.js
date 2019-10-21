document.addEventListener('DOMContentLoaded', function(){
	var map = document.getElementById('glennopolis'),
		scenes = ['scene0', 'scene1', 'scene2', 'scene3', 'scene4'],
		zooms =  [1,        1.6,      1.3,      2,        1.4],
		scenarios = {};

	if (io && map){
		counter_scale_markers();

		var recalc_llama = debounce(function(){
			down_llama.resize();
			up_llama.resize();
		}, 200);

		var down_llama = scrollama(),
			up_llama = scrollama(),
			steps = map.parentNode.parentNode.querySelectorAll('.scenario-holder > li');

		down_llama.setup({
			step: steps,
			offset: .9
			// ,debug: true
		}).onStepEnter(map_step_down);

		up_llama.setup({
			step: steps,
			offset: .2,
			container: map.parentNode.parentNode,
			graphic: map
			// ,debug: true
		}).onStepEnter(map_step_up)
		.onContainerExit(map_hard_reset);

		window.addEventListener('resize', recalc_llama);
	}

	function map_hard_reset(ll){
		if (ll.direction === 'up'){
			delete map.currentScene;
			map.className = 'm-active';
		}
	}

	function map_step_down(ll){
		if (ll.direction === 'up'){ return; }

		var _scene = scenes[ll.index];

		if (map.hasOwnProperty('currentScene') && map.currentScene === _scene){ return; }

		map.currentScene = _scene;
		scenarios[_scene](ll.index);
		// ll.element.classList.add('current');
	}

	function map_step_up(ll){
		if (ll.direction === 'down' || ll.index === 4){ return; }

		var _scene = scenes[ll.index];

		if (map.hasOwnProperty('currentScene') && map.currentScene !== 'scene0' && map.currentScene === _scene){ return; }

		map.currentScene = _scene;
		scenarios[_scene](ll.index);
		// ll.element.classList.add('current');
	}

	scenarios.scene0 = function(_i){
		map.className = 'm-inactive';
		map.firstElementChild.style = '';
	}

	scenarios.scene1 = function(_i){
		// clean-up if we're replaying
		if (map.hasOwnProperty('scene1')){
			// reset starting positions
			map.scene1.person.style = '';
			map.scene1.security.style = '';

			// reset the person marker
			change_marker(map.scene1.person.firstElementChild, 'person');
		} else {
			var markers = map.querySelector('.markers.scene1');
			if (!markers){return;}

			var person = markers.lastElementChild,
			security = markers.firstElementChild;
			if (!person || !security || person === security){return;}
		}

		map.className = 'scenario1 campus';

		if (map.hasOwnProperty('scene1')){
			map.scene1.timeline.restart();
			return;
		}

		var timeline = anime.timeline({
			elasticity: 0,
			easing: 'linear'
		});

		timeline.add({
			targets: map.firstElementChild,
			scale: zooms[_i],
			translateX: '-44.12%',
			translateY: '-42.06%',
			duration: 500
		}).add({
			targets: person,
			translateX: -36,
			translateY: 19,
			duration: 1500,
			offset: '+=500',
			complete: function(){
				change_marker(person.firstElementChild, 'alert');
			}
		}).add({
			targets: security,
			translateX: 220,
			translateY: 85,
			duration: 1000,
			offset: '+=300'
		}).add({
			offset: '+=300',
			begin: function(){
				change_marker(person.firstElementChild, 'okay');
			}
		});

		map.scene1 = {person: person, security: security, timeline: timeline};
	}

	scenarios.scene2 = function(_i){
		// clean-up if we're replaying
		if (map.hasOwnProperty('scene2')){
			// reset starting position
			map.scene2.security.style = '';

			// and reset the markers
			change_marker(map.scene2.person, 'person');
			var people = map.scene2.people.children;
			for (var i = 0; i < people.length; i++) {
				change_marker(people[i], 'person');
			}
		} else {
			var markers = map.querySelector('.markers.scene2');
			if (!markers){return;}

			var groups = markers.children;
			if (!groups || groups.length !== 3){return;}
		}

		map.className = 'scenario2 campus';

		if (map.hasOwnProperty('scene2')){
			map.scene2.timeline.restart();
			return;
		}

		var timeline = anime.timeline({
			elasticity: 0,
			easing: 'linear'
		});

		timeline.add({
			targets: map.firstElementChild,
			scale: zooms[_i],
			translateX: '-18.7%',
			translateY: '-42.06%',
			duration: 500
		}).add({
			// earthquake
			targets: map,
			translateX: [ { value: 0 }, { value: '-1em' }, { value: 0 }, { value: '1em' }, { value: 0 }, { value: '-2em' }, { value: 0 }, { value: '2em' }, { value: 0 }, { value: '-1em' }, { value: 0 } ],
			translateY: [ { value: 0 }, { value: '.25em' }, { value: '.25em' }, { value: 0 }, { value: '-.25em' }, { value: '-.25em' }, { value: 0 }, { value: '.125em' }, { value: 0 }, { value: '-.125em' }, { value: 0 } ],
			duration: 900,
			offset: '+=800'
		}).add({
			targets: groups[1].children,
			offset: '+=100',
			begin: function(anim){
				change_marker(groups[0], 'alert');
				for (var i = 0; i < anim.animatables.length; i++) {
					change_marker(anim.animatables[i].target, 'alert')
				}
			}
		}).add({
			targets: groups[1].children,
			offset: '+=500',
			begin: function(anim){
				for (var i = 0; i < anim.animatables.length; i++) {
					change_marker(anim.animatables[i].target, 'okay', 100 * i);
				}
			}
		}).add({
			targets: groups[2],
			translateX: [ { value: -300 }, { value: -300 } ],
			translateY: [ { value: -30 }, { value: -70 } ],
			duration: 1000,
			offset: '+=500'
		}).add({
			offset: '+=300',
			begin: function(){
				change_marker(groups[0], 'okay');
			}
		});

		map.scene2 = {person: groups[0], people: groups[1], security: groups[2], timeline: timeline};
	}

	scenarios.scene3 = function(_i){
		// clean-up if we're replaying
		if (map.hasOwnProperty('scene3')){
			// reset starting position
			map.scene3.security.style = '';
			map.scene3.question.style = '';

			// and reset the marker
			change_marker(map.scene3.person, 'person');
		} else {
			var markers = map.querySelector('.markers.scene3');
			if (!markers){return;}

			var groups = markers.children;
			if (!groups || groups.length !== 3){return;}
		}

		map.className = 'scenario3 hospital';

		if (map.hasOwnProperty('scene3')){
			map.scene3.timeline.restart();
			return;
		}

		var timeline = anime.timeline({
			elasticity: 0,
			easing: 'linear'
		});

		timeline.add({
			targets: map.firstElementChild,
			scale: [ { value: 1 }, { value: [1, zooms[_i] ] } ],
			translateX: [ { value: 0 }, { value: 0 } ],
			translateY: [ { value: 0 }, { value: [0, '-9.346%'] } ],
			duration: 1000
		}).add({
			// question
			targets: groups[2],
			translateX: [ { value: [0, -120], duration: 500 }, { value: 0, duration: 300 } ],
			opacity: [ { value: 0, duration: 1 }, { value: [1, 1], duration: 250 }, { value: [1, 0], duration: 250 }, { value: 0, duration: 300 } ],
			offset: '+=800',
			complete: function(){
				change_marker(groups[0], 'okay');
			}
		}).add({
			// reset
			offset: '+=500',
			begin: function(){
				change_marker(groups[0], 'person');
			}
		}).add({
			// question
			targets: groups[2],
			translateX: [ { value: [0, -120], duration: 500 }, { value: 0, duration: 300 } ],
			opacity: [ { value: [1, 1], duration: 250 }, { value: [1, 0], duration: 250 }, { value: 0, duration: 300 } ],
			offset: '+=300',
			complete: function(){
				change_marker(groups[0], 'okay');
			}
		}).add({
			// reset
			offset: '+=500',
			begin: function(){
				change_marker(groups[0], 'person');
			}
		}).add({
			// question
			targets: groups[2],
			translateX: [ { value: [0, -120], duration: 500 }, { value: 0, duration: 1300 } ],
			opacity: [ { value: [1, 1], duration: 250 }, { value: [1, 0], duration: 250 }, { value: 0, duration: 1300 } ],
			offset: '+=300',
			complete: function(){
				change_marker(groups[0], 'alert');
			}
		}).add({
			// security
			targets: groups[1],
			translateX: [ { value: 0 }, { value: -160 }, { value: -160 } ],
			translateY: [ { value: 20 }, { value: 20 }, { value: -13 } ],
			duration: 1200,
			offset: '+=600'
		}).add({
			offset: '+=300',
			begin: function(){
				change_marker(groups[0], 'okay');
			}
		});

		map.scene3 = {person: groups[0], question: groups[2], security: groups[1], timeline: timeline};
	}

	scenarios.scene4 = function(_i){
		// clean-up if we're replaying
		if (map.hasOwnProperty('scene4')){
			// reset starting position
			map.scene4.security[0].style = '';
			map.scene4.security[1].style = '';
			map.scene4.red[0].style = '';
			map.scene4.red[1].style = '';
		} else {
			var markers = map.querySelector('.markers.scene4');
			var heatmaps = map.querySelector('.heatmaps.scene4');
			if (!markers || !heatmaps){return;}

			var groups = markers.children;
			if (!groups || groups.length !== 3){return;}

			var reds = heatmaps.children;
			if (!reds || reds.length !== 3){return;}
		}

		map.className = 'scenario4 campus';

		if (map.hasOwnProperty('scene4')){
			map.scene4.timeline.restart();
			return;
		}

		var timeline = anime.timeline({
			elasticity: 0,
			easing: 'linear'
		});

		timeline.add({
			targets: map.firstElementChild,
			scale: [ { value: 1 }, { value: [1, zooms[_i] ] } ],
			translateX: [ { value: 0 }, { value: [0, '-30.59%'] } ],
			translateY: [ { value: 0 }, { value: [0, '-42.06%'] } ],
			duration: 1000
		}).add({
			targets: groups[1],
			translateX: [ { value: -100 }, { value: -70 } ],
			translateY: [ { value: -120 }, { value: -160 } ],
			duration: 1200,
			offset: 2800
		}).add({
			targets: reds[1],
			opacity: 0,
			duration: 1000,
			offset: '-=900'
		}).add({
			targets: groups[2],
			translateX: 60,
			translateY: -95,
			duration: 1200,
			offset: 3200
		}).add({
			targets: reds[2],
			opacity: 0,
			duration: 1200,
			offset: '-=700'
		});

		map.scene4 = {security: [groups[1], groups[2]], red: [reds[1], reds[2]], timeline: timeline};
	}

	function counter_scale_markers(){
		var scene,
			scale_factor,
			markers,
			bbox, offsetX, offsetY;

		scenes.forEach(function(scn, index){
			scale_factor = 0;

			scene = map.querySelector('.markers.'+scn);
			if (!scene) {return;}

			if (!scale_factor){
				scale = zooms[index];
				if (scale){ scale_factor = 1 / scale; }
			}

			markers = scene.querySelectorAll('use');
			for (var i = 0; i < markers.length; i++) {
				if (scale_factor && scale_factor !== 1){
					bbox = markers[i].getBBox();
					if (bbox){
						offsetX = (scale_factor - 1) * -1 * (bbox.x + (bbox.width / 2)); // center
						offsetY = (scale_factor - 1) * -1 * (bbox.y + (bbox.height)); // bottom
						markers[i].style.transform = 'translate('+offsetX+'px, '+offsetY+'px) scale('+scale_factor+')';
					}
				}
			}
		});
	}

	function change_marker(el, to, delay){
		delay = delay || 0;
		if (delay){
			return setTimeout(function(){
				el.setAttribute('xlink:href', '#marker-'+to);
			}, delay);
		}

		el.setAttribute('xlink:href', '#marker-'+to);
	}
});
