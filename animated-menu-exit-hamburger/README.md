## Animated Menu/Exit Hamburger

> This was to be the big hero piece of the new Zenman website. Our designer had brilliantly set the hamburger as the E in `MENU`, which then became the X in `EXIT`. Looking at this in our static mockups, I decided I could not settle for anything less than a complete transition between each letter.

[DEMO](https://ryansalerno.github.io/code-samples/animated-menu-exit-hamburger/)

([enlarged and isolated](https://ryansalerno.github.io/code-samples/animated-menu-exit-hamburger/isolated.html))

Step one was to recreate the SVG letterforms and brainstorm some morphing options. I didn't want to cheat and use Greensock to morph the letters for me, so I had to have the same number of points in each version of each letter. This required carefully controlling the order and position of every point so [Anime.js](https://animejs.com/) could tween them smoothly. In maybe the smartest thing I did during my whole tenure there, I named the file I used to create the letters ["hamburger helper"](./src/assets/hamburger-helper.svg).

To further complicate this task, I wanted them all to appear to be doing something different from each other, hence the counter angles and directions of movement. The `U -> T` transition gave me trouble conceptually, but ended up coming together neatly. The first time I actually saw the `N` rotate into the `I`, though, I just took my hands off my keyboard and had to walk away. I may never execute anything quite that nice again.

(Some scripts for scoll-locking the menu at smaller viewports, and doing fixed-header-y things as you scrolled down the page have been removed here in the interest of simplicity.)

I also took the liberty of animating the `ZEN` mask image over the little [placeholder] background video in what I thought was a pretty clever way. Have I mentioned that obsessing over SVGs makes me happy?
