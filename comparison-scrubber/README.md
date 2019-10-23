## Comparison Scrubber

> Meant for displaying before and after screenshots of websites, this side-by-side scrubber works really well, and includes a nav for swapping in additional photos. Since originally pitching this interaction, I've seen implementations much more commonly, but I wrote this before there were quite so many around to crib from.

[DEMO](https://ryansalerno.github.io/code-samples/comparison-scrubber/)

There are two key JS files at work here. The first one [sets up the scrubbing interaction and image swapping](./src/js/compare-this.js) with a nice little class-like factory. I'm still pleased with how this works whenever I interact with it. The other one [does `srcset` things with background images](./src/js/bg-srcset.js). This was definitely a rabbit hole when it happened, but I kind of liked the flexibility of it, and tried to make sure it was generically callable so I could roll it out all over the site. It does have the negative effect of downloading a useless small image on larger screens, but it's smart enough to know when it's already got a large enough image and won't swap sizes down (if you're a developer and are shrinking your browser window, say).

There is a little bit of weirdness in [the template](./src/css/module-comparison_scrubber.php) because I was trying to unload ACF on the front-end to juice performance a little extra and wrote my own helper functions to get the data directly out of post_meta. But if you squint a little and look past that, the logic for displaying everything is simple and concise.

I really appreciate the visual phone gag in the images here, though I felt very old when the designers didn't understand my "Zack Morris phone" reference and had to Google for what cellphone bricks used to look like....
