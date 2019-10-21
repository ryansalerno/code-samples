## Physician Finder

> There was a period where I was making complicated maps slightly too often. This one is not my favorite (it filters by fewer criteria at once), but the client manufactured a medical instrument and had some highly specific legal requirements to not appear to be favoring any single physician. So even if the distance is ridiculous, I needed to return a fixed number of results, sorted by distance away from the search point.

[DEMO](https://ryansalerno.github.io/code-samples/physician-finder/)

The filters are created dynamically, based on available data on the physicians on the page. Also, there's a neat interaction where you can click any listing for a physician and the map will select the corresponding marker. The logic and Google Maps API code is [less long than you'd think](./src/js/physician-finder.js) but still probably not a blast to read through.

[In the functions file](./src/templates/map-functions.php) there's a nice feature that caches the results to a static JSON file whenever the custom post type is saved (and specifically GeoJSON for easier ingesting into the map as markers).

There is some hidden handling of "specialties" in the code, so if the manufacturer adds a new device the same files and scripts can show results for each of the devices (set as a taxonomy on the physician post type).
