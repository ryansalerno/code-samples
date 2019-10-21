function initMap(){
	// config vars (maybe we should expose these to the client so they're definable in CMS and localized?)
	var filters_show_above = map_helpers.filters_show_above || 5,
		max_miles_for_zipcode = map_helpers.max_miles_for_zipcode || 100,
		min_results_shown = map_helpers.min_results_shown || 5;

	// get your filter on
	var filterers = document.getElementById('map-filters'),
		the_map = document.getElementById('map');

	// make a map
	var gmap = new google.maps.Map(the_map, {
		// zoom and center will be overridden after the map loads, but we ought to start somewhere...
		zoom: 5,
		center: {
			// https://en.wikipedia.org/wiki/Geographic_center_of_the_contiguous_United_States
			lat: 39.5,
			lng: -98.35
		},
		mapTypeControl: false,
		streetViewControl: false,
		fullscreenControl: false,
		styles: mapstyle
	});

	// init some wider-scoped variables for later re-use
	var bounds = new google.maps.LatLngBounds(),
		geocoder = new google.maps.Geocoder(),
		nothing = document.getElementById('no-results'),
		listings = document.getElementById('map-listings'),
		listing_map = {},
		states = [],
		specialties = [],
		markers = [],
		prev_center;

	discover_listings();

	// clusters make things easier to digest
	var markerCluster = new MarkerClusterer(gmap, markers, {
		styles: [{
			height: 48,
			width: 48,
			url: map_helpers.siteurl+'/src/assets/map-cluster.svg',
			textColor: "#000",
			fontWeight: "normal",
			anchorIcon: [46,24],
			anchorText: [-4,0]
		}]
	});

	// load all the practices from the (wp-localized) json file
	gmap.data.loadGeoJson(map_helpers.siteurl + map_helpers.physician_json, null, function(features){
		// for each practice...
		features.forEach(function(feature){
			// get the position
			var pos = feature.getGeometry().get();

			var icon = {
				url: map_helpers.siteurl+'/src/assets/map-pin.svg',
				scaledSize: new google.maps.Size(48, 48)
			};

			// create a marker
			var marker = new google.maps.Marker({
				'position': pos,
				'id': feature.getId(),
				'icon':  icon
			});

			// handle clicks on the marker
			google.maps.event.addListener(marker, 'click', function(){
				// set this variable to where the map was previously (so we can pan back there after closing it)
				prev_center = gmap.getCenter();
				// pop up some info
				make_infowindow(feature);
			});

			var include = true;
			// if (map_helpers.specialty !== 'all'){
			// 	var lowercase = feature.getProperty('specialties').map(function(s){
			// 		return s.toLowerCase().replace(' ', '-', 'g'); // TODO: this is not the same as WP's slugs....
			// 	});
			// 	include = (lowercase.indexOf(map_helpers.specialty.toLowerCase()) > -1);
			// }

			if (include){
				markers.push(marker);

				// extend our empty bounds element (in order to center the map to visible markers)
				bounds.extend(pos);

				var state = feature.getProperty('state');
				if (states.indexOf(state) < 0){
					states.push(state);
				}
			}
		});

		markerCluster.addMarkers(markers);

		if (filterers && markers.length > filters_show_above){
			create_specialty_filter();

			filterers.classList.remove('hidden');
			filterers.addEventListener('submit', function(evt){
				evt.preventDefault();
				get_filters(this);
				return false;
			});
		}
	});
	// hide the non-clustered markers
	gmap.data.setStyle({visible: false});

	// recenter the map if we've got markers and have a new bounding box
	google.maps.event.addListenerOnce(gmap, 'tilesloaded', function() {
		if (!bounds.equals(new google.maps.LatLngBounds())){
			this.fitBounds(bounds);
		}
	});

	// assign an infowindow to a variable so we can do things with it
	var infoWindow = new google.maps.InfoWindow();
	// default pins are 48px, so pull it back a bit for better centering
	infoWindow.setOptions({
		pixelOffset: new google.maps.Size(0, -24)
	});

	// pan back to our last center when closing the popup (since the map pans to fit the contents of it by default)
	infoWindow.addListener('closeclick', function(){
		gmap.panTo(prev_center);
	});

	// google.maps.event.addListener(gmap, 'idle', function(){
	// 	window.history.replaceState(null, null, '#'+gmap.getCenter().toUrlValue()+','+gmap.getZoom());
	// });

	// build some output for our popups
	function make_infowindow(feature){
		var listing = document.querySelector('dd[data-id="' + feature.getId() + '"]');
		if (!listing){ return; }

		var content = '<aside class="margins-on map-popup">' + listing.innerHTML + '</aside>';

		infoWindow.setContent(content);
		infoWindow.setPosition(feature.getGeometry().get());
		infoWindow.open(gmap);
	}

	function get_filters(form){
		var inputs = ['zip'],
			selects = ['specialty'],
			// checkboxes = ['medicaid', 'spanish'], // fun fact: unchecked checkboxes have the same "value" as checked ones
			values = {};

		inputs.forEach(function(input){
			var value = get_input_value(input, form);
			if (value){
				values[input] = value;
			}
		});

		selects.forEach(function(input){
			var value = get_select_value(input, form);
			if (value){
				values[input] = value;
			}
		});

		// checkboxes.forEach(function(input){
		// 	var value = get_checkbox_value(input, form);
		// 	if (value){
		// 		values[input] = value;
		// 	}
		// });

		if (values.hasOwnProperty('zip')){
			// get lat/long from zipcode
			geocoder.geocode( { 'address': values.zip }, function(results, status) {
				if (status == 'OK') {
					var zip_lat = results[0].geometry.location.lat();
					var zip_lng = results[0].geometry.location.lng();

					values.zip = {};
					values.zip.lat = zip_lat;
					values.zip.lng = zip_lng;
				} else {
					// something went wrong, but at least filter on anything else submitted
					delete values.zip;

					// console.log('Geocoding failed: ' + status);
				}

				// we have to call this from the callback here because the response from the geocoder is asynchronous
				filter_markers(values);
			});
		} else {
			// filter immediately
			filter_markers(values);
		}
	}

	function filter_markers(criteria){
		// console.log(criteria);

		infoWindow.close();

		var matched = [],
			distances = [],
			minimum_miles = 3000;

		bounds = new google.maps.LatLngBounds();

		nothing.classList.add('hidden');

		// instead of worrying about states and whether to add/remove if exists, we'll just wipe and re-add
		markerCluster.clearMarkers();

		markers.forEach(function(marker){
			var feature = gmap.data.getFeatureById(marker.id),
				show = true;

			for (var key in criteria){
				var is_match = criteria_test(key, criteria, feature);
				if (!is_match){show = false;}
				// console.log(key, is_match);
			}

			if (show){
				matched.push(marker);
				bounds.extend(marker.getPosition());
			} else {
				// we already cleared them, so no need to remove individually
			}
		});

		if (distances.length){
			distances.sort(function(a, b){
				if (a.distance < b.distance){ return -1; }
				if (a.distance > b.distance){ return 1; }

				return 0;
			});

			var combined = [];
			if (distances.length > matched.length){
				combined = matched;
			}
			matched = [];
			// bounds = new google.maps.LatLngBounds();

			// console.log(distances, combined);

			distances.forEach(function(d){
				if (d.distance > max_miles_for_zipcode && matched.length >= min_results_shown){ return; }

				var marker = pluck_marker_by_id(d.id);

				if (combined.length){
					if (combined.indexOf(marker) > -1){
						matched.push(marker);
						// bounds.extend(marker.getPosition());
					}
				} else {
					matched.push(marker);
				}

			});
		}

		markerCluster.addMarkers(matched);

		update_listings(matched, distances);

		if (criteria.hasOwnProperty('zip')){
			// zipcode entered, so center to it instead of the results
			gmap.setCenter(new google.maps.LatLng(criteria.zip.lat, criteria.zip.lng));
			gmap.setZoom(approximate_zoom_level(minimum_miles));
		} else if (matched.length){
			// zoom out a little if we're only looking at one marker
			if (bounds.getNorthEast().equals(bounds.getSouthWest())){
				var extended1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
				var extended2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
				bounds.extend(extended1);
				bounds.extend(extended2);
			}

			gmap.fitBounds(bounds);
		}

		if (matched.length < 1){
			nothing.classList.remove('hidden');
		}

		// we're awkwardly putting this in here so minimum_miles is scoped to be available without reference
		function criteria_test(which, search, feature){
			switch (which) {
				case 'zip':
					var miles = haversine([search.zip.lat, search.zip.lng], [feature.getGeometry().get().lat(), feature.getGeometry().get().lng()]);
					minimum_miles = Math.min(miles, minimum_miles);
					distances.push({"id": feature.getId(), "distance": miles});
					return 1;
					break;
				case 'specialty':
					var possible = feature.getProperty('specialties');
					return (possible.indexOf(search[which]) > -1);
					break;
				default:
					return search[which] == feature.getProperty(which);
			}
		}
	}

	nothing.addEventListener('click', function(){
		nothing.classList.add('hidden');
		// filter_markers({});
	});

	listings.classList.add('js');
	listings.addEventListener('click', function(evt){
		el = was_that_a_dd(evt.target);
		if (!el){ return; }

		if (el.hasAttribute('data-id')){
			activate(el.getAttribute('data-id'));
		}
	});

	function activate(id){
		marker = pluck_marker_by_id(id);
		if (typeof marker === 'Undefined'){ return; }

		gmap.setCenter(marker.getPosition());
		if (gmap.getZoom() < 13){
			gmap.setZoom(13);
		}
		new google.maps.event.trigger( marker, 'click' );

		the_map.scrollIntoView({'behavior': 'smooth'});
	}

	function was_that_a_dd(el){
		var ignore = ['DL', 'DT'];
		if (ignore.indexOf(el.nodeName) > -1){ return false; }

		while (el.nodeName !== 'DD') {
			el = el.parentNode;
		}

		return el;
	}

	function pluck_marker_by_id(id){
		if (!Array.prototype.find){ return; }

		return markers.find(function(el){
			return el.id == id;
		});
	}

	function discover_listings(){
		var children = listings.children,
			childcount = children.length,
			state;

		for (var i = 0, id, meta, s, j; i < childcount; i++) {
			if (children[i].nodeName === 'DT'){
				state = children[i].textContent;
			} else {
				id = children[i].getAttribute('data-id');
				listing_map[id] = {
					'state': state,
					'el': children[i]
				};

				meta = children[i].querySelector('ul.meta');
				if (meta){
					s = meta.children;

					for (j = 0; j < s.length; j++) {
						if (specialties.indexOf(s[j].textContent) < 0){
							specialties.push(s[j].textContent);
						}
					}
				}
			}
		}
	}

	function update_listings(show, distances){
		var ids = show.map(function(m){
			return m.id;
		});

		listings.innerHTML = '';
		var matches = {};

		ids.forEach(function(id){
			if (!listing_map.hasOwnProperty(id)) { return; }
			var dd = listing_map[id];

			if (!matches.hasOwnProperty(dd.state)){
				matches[dd.state] = [];
			}

			matches[dd.state].push(dd.el);
		});

		for (state in matches){
			listings.innerHTML += '<dt class="h3">'+state+'</dt>';
			matches[state].forEach(function(m){
				var prev = m.querySelector('p.distance');
				if (prev){
					prev.parentNode.removeChild(prev);
				}

				if (typeof distances !== 'Undefined' && distances.length && Array.prototype.find){

					var dist = document.createElement('p'),
						away = distances.find(function(el){
							return el.id == m.getAttribute('data-id');
						});

					dist.classList.add('distance');
					dist.textContent = '(' + away.distance.toFixed(2) + ' miles away)';
					m.firstElementChild.appendChild(dist);
				}
				listings.appendChild(m);
			});
		}
	}

	function create_state_filter(){
		if (states.length < 2){ return; }

		var select = document.createElement('select');
		select.name = 'state';

		select.innerHTML = '<option value="">All</option>';

		states.forEach(function(s){
			var opt = document.createElement('option');
			opt.textContent = s;
			select.appendChild(opt);
		});

		var label = document.createElement('label');
		label.textContent = 'State';
		label.appendChild(select);

		filterers.insertBefore(label, filterers.lastElementChild);
	}

	function create_specialty_filter(){
		if (specialties.length < 1){ return; }

		var select = document.createElement('select');
		select.name = 'specialty';

		select.innerHTML = '<option value="">All</option>';

		specialties.forEach(function(s){
			var opt = document.createElement('option');
			opt.textContent = s;
			select.appendChild(opt);
		});

		var label = document.createElement('label');
		label.textContent = 'Specializing In';
		label.appendChild(select);

		filterers.insertBefore(label, filterers.lastElementChild);
	}
}

function approximate_zoom_level(miles){
	// set some minimum and maximum zoom levels and fudge some numbers in between for various distances
  var magic_number = 5;
	switch (true) {
		case miles < 5:
			magic_number = 13;
			break;
		case miles < 25:
			magic_number = 12;
			break;
		case miles < 75:
			magic_number = 9;
			break;
		case miles < 150:
			magic_number = 7;
			break;
	}

  if (window.innerWidth < 800){
    magic_number--;
  }

  return magic_number;
}

function fuzzy_search(needle, haystack){
	if (typeof haystack === 'string'){
		haystack = haystack.split(' ');
	}

	var results = [],
		regex = new RegExp('(?=.*' + needle.split(' ').join(')(?=.*') + ')', 'i');

	for (var i = 0; i < haystack.length; i++) {
		if (regex.test(haystack[i])) {
			results.push(haystack[i]);
		}
	}
	return (results.length > 0);
}

function get_input_value(key, form){
	var input = form.querySelector('input[name='+key+']');
	if (input){
		return input.value.trim();
	}
}

function get_select_value(key, form){
	var select = form.querySelector('select[name='+key+']');
	if (select){
		return select.value.trim();
	}
}

function get_checkbox_value(key, form){
	var input = form.querySelector('input[name='+key+']');
	if (input){
		return input.checked;
	}
}

function haversine(coords1, coords2){
	var deg2rad = 0.017453292519943295; // Math.PI / 180

	coords1[0] *= deg2rad;
	coords1[1] *= deg2rad;
	coords2[0] *= deg2rad;
	coords2[1] *= deg2rad;

	var a = ((1 - Math.cos(coords2[0] - coords1[0])) + (1 - Math.cos(coords2[1] - coords1[1])) * Math.cos(coords1[0]) * Math.cos(coords2[0]) ) / 2;

	return 7917.5 * Math.asin(Math.sqrt(a)); // 7917.5 = diameter of Earth in miles
}

function tempclass(el, c, timeout){
	el.classList.add(c);
	setTimeout(function(){
		el.classList.remove(c);
	}, timeout || 1000);
}
