# Deployment Guide

Below manual hacks are required for Genesis UI Integration, because their UI:

- does not have a static asset folder.
- cannot handle static assets without processing them through webpack import.

## Hack Steps
1. Compile CSS with `yarn build:css`

2. Rename `public/static/semantic.css` and `public/static/semantic.css` to `.less`
   
3. Compile CSS without `ui-render` prefix

```js
// less-watcher-compiler.config.js
postcssPlugins: [
  // ['postcss-prefixwrap', '.ui-render']
]
```

4. Copy Semantic UI `Popup` line in `public/static/semantic.css`

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

5. Manually replace copied line above to the bundled file `public/static/semantic.less`.

6. Uncomment prefix CSS in step 3 

7. Replace all variables below to string literals in `public/static`:
```less
@color-focus:             ~"rgb(40 99 169/20%)";
@color-focus-error:       ~"rgb(218 20 20/20%)";
@color-shadow:            ~"rgb(0 0 0/15%)";
```

8. Remove Google Fonts `@import` statement from `public/static/all.less`

```css
@import url("https://fonts.googleapis.com/css?family=Roboto:300,600|Open Sans:300,600&display=swap&subset=cyrillic");
```

9. Remove all instances of query string added inside `.less` files, for example

`fonts/iconsOpenL.eot?id0mra`

10. Remove all `.css` files
