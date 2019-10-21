## Modal Videos

> This module is very basic, but nice to use on the backend, and allows for dead easy video embedding. But instead of just running an oEmbed, we jump through some stupid hoops to only load the embed on click (and to try to load it natively on mobile, and also just link off appropriately when there's no JS present).

[DEMO](https://ryansalerno.github.io/code-samples/modal-videos/)

Markup is using the video thumbnail automatically instead of asking for another still, and it presents as just a link to the original video URL so the right thing happens without JS or on small enough screens (where a lightbox would be unhelpful compared to the native UI, and also presumably a phone that would recognize the URL and play in a native app where available).

Little happens [in JS](./src/js/modal-videos.js) other than creating the video lightbox on demand. The shade under the modal video closes on click, and on various close-related keypresses. Because it destroys the iframe, sound stops without using any JS APIs, and the video starts again on subsequent presses. There is the assumption (and a note in the backend) that the video is on YouTube or Vimeo, even though an oEmbed supports any number of sites--supporting other sites would be a fairly trivial extension of the functions.

Just as you'd expect, [the CSS](./src/css/module-back-and-forth.scss) is using flexbox and `order` to achieve the back and forthing, but there's also a little breakout from content-width to do the zebra stripes.

[The template](./src/templates/module-back_and_forth.php) makes use of some little ACF helpers (left into the [functions file](./src/templates/custom-functions.php) for reference) but the functions of interest here are the oEmbed ones just under the template helpers in that functions file.
