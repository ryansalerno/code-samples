## Scrolling Map Animation

This is an overly complex SVG animation for a security-related client. They wanted to illustrate some key scenarios their product addresses, and I agreed to do some fancy animations to help tell the stories.

[DEMO](https://ryansalerno.github.io/code-samples/scrolling-map-animation/)

To kick this off, I was given a 1.8mb exported file for an isometric city that I had to unravel and make sense of. After meticulously organizing and grouping and ordering layers, and hand-tuning paths and simplifying and reusing elements--all in code--I ended up with a [66.7kb uncompressed SVG](./src/assets/glennopolis.svg) over which I had near-complete control. (Yes, that was a mind-melting couple of days, thank you for asking.) There is still a part of my brain that wants to redraw the buildings with proper mathematical perspective and simpler overlapping shapes instead of so many connecting individual pieces, but that's an entirely unnecessary time sink that I've done well to avoid slipping into.

Animations were scripted with timelines using [Anime.js](https://animejs.com/), and scenes shifted as you scroll through content using [Scrollama](https://github.com/russellgoldenberg/scrollama). This interaction was important to me because a visitor shouldn't have to wait through an animation (especially on subsequent visits) to read the features; so even though this was a showpiece for the site, I wanted the animations to be secondary illustrations to and of the content, and to have them play with a single trigger and not unfold on a [more] massive scroll.

The color changing and boundaries for the scenes are changed/animated [in CSS](./src/css/module-glennopolis.scss). I did what I could to make it functional across resolutions, and with as much graceful degradation as seemed feasible.

[&larr; back to index](https://github.com/ryansalerno/code-samples)
