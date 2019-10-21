## Vertical Tabs

> This module is a good example of being thorough and being overly nerdy about keeping things simple.

[DEMO](https://ryansalerno.github.io/code-samples/vertical-tabs/)

It lays itself out based on available width, waiting for resizes or orientation changes to see if it needs to adapt or not. And since the interactive view requires JS for the interaction, [why not build it entirely in JS](./src/js/totally-tabular.js) so nothing non-functional is in the markup requiring itself to be hidden, or--worse--sitting there non-interactively?

And while we're doing some lifting in JS, let's also be performance nerds (and acknowledge that visitors often won't interact with your little interactive thing) by only loading images on demand, after interaction.

Also, because I am extra old school, there are [specific styles](./src/css/module-vertical-tabs.scss) only when JS is known to be available (and working).

[This template](./src/templates/module-vertical_tabs.php) does nothing very interesting, and is complex-looking only because it tries to check for every optional thing before outputting any empty markup.

I would call this slighty over-engineered, but it's also just really functional and nice. And most of the scripts on this site were equally well-commented in production (none of the JS comments were added or edited for being featured here).
