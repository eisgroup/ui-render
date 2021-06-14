# Deployment Guide

Below manual hacks are required for Genesis UI Integration, because their UI:

- does not have a static asset folder.
- cannot handle static assets without processing them through webpack import.

## Hack Steps

1. Compile CSS without `ui-render` prefix

```js
// less-watcher-compiler.config.js
postcssPlugins: [
  // ['postcss-prefixwrap', '.ui-render']
]
```

2. Copy Semantic UI `Popup` line in `public/static/semantic.css`

```css
/*!
 * # Semantic UI - Popup
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
.ui.popup, .ui.search.dropdown > input.search:not
```

3. Uncomment prefix CSS in step 1, build bundle, then manually replace copied line in step 2 to the bundled file of the
   same name.

4. Remove Google Fonts `@import` statement from `public/static/all.css`

```css
@import url("https://fonts.googleapis.com/css?family=Roboto:300,600|Open Sans:300,600&display=swap&subset=cyrillic");
```

5. Remove all instances of query string added inside compiled css files, for example

`fonts/iconsOpenL.eot?id0mra`

6. Rename all `.css` files to `.less`
