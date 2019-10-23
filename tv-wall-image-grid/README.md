## TV Wall Image Grid

> A client that provides mobile television studios needed an image gallery, and I thought it would be cute to mimic the TV Wall conceit of looking at a bunch of smaller images and loading an important one into a bigger view. The final module has a map of different layouts based on how many images they're trying to show and degrades in a way that stays completely usable and doesn't let on that you're missing anything.

[DEMO](https://ryansalerno.github.io/code-samples/tv-wall-image-grid/)

*Note that since this demo is static, but part of the fun here is the variable layout, I made a little slider to let you run through different image counts.*

Since the primary use for this gallery is on a page providing the full specs of a specific mobile unit, and the page will often be accessed by someone as a reference while they're in the field working (or about to be working) in the unit, page speed was a big concern. This is why the first image isn't loaded into the larger spotlight area by default; until you want to look at the images, maybe we shouldn't load a larger version of anything.

The layouts are handled through a count-based class, and there are fallbacks and considerations for when there is no JS and when `display: grid` isn't supported. All of this is pretty well documented [in the CSS file](./src/css/module-image-grid.scss), including some fun ASCII representations of the layouts.

[The template](./src/templates/module-image_grid.php) fetches the images and applies our counted class. The first version had some even-numbered layouts that didn't look nearly as good as the odd-numbered ones, so I eventually came up with the idea to pad them with a blank `LI`.

The gallery aspect is swapping selected images into a larger display area. [The JS here](./src/js/tv-wall.js) is pretty straightforward. Of note is that everything still works well without JS, and the script takes care of any changes it needs when it is known to be running. Also, we're cheating a little and relying on `srcset` to select the thumbnail and larger images for us without any logic needing to be written--which I think is a neat hack.

The filler images [are a nice looking test pattern](./src/assets/testpattern.svg). I had occasion to need one elsewhere on the site and since it was just hanging around, I figured it could work for our empty picture here. (I couldn't find a nice widescreen test pattern anywhere, so I, um, drew this one from scratch in my editor.)
