# Deployment Guide

Below manual hacks are required for integration with the parent application, as a parent UI may have nex restrictions:

- does not have a static asset folder.
- cannot handle static assets without processing them through webpack import.
- cannot bundle pure js packages that use ES6 (like `module-pack`, `ui-react-pack`, `utils-pack`, `validator`...).

## Hack Steps
0. Pre-Build: Run `yarn start` to generate `css` files in `public/static` directory
1. Compile CSS with `yarn build`

2. Rename `.css` extensions in `public/static/semantic.css` and `public/static/all.css` to `.less`

// Deprecated #3, #4, #5, #6, #8, #10

3. Compile CSS without `ui-render` prefix (temporary comment `postcss-prefixwrap` line)

```js
// less-watcher-compiler.config.js
postcssPlugins: [
  // ['postcss-prefixwrap', '.ui-render']
]
```
then `yarn build:css`

4. Copy Semantic UI `Popup` line in `public/static/semantic.css` to the clipboard (keep the copy somewhere)

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

7. Remove all `.css` files

8. Replace all strings like `~"rgb(40 99 169/20%)"` to `rgb(40 99 169/20%)` in `public/static` if exist:
```less
@color-focus:             ~"rgb(40 99 169/20%)";
@color-focus-error:       ~"rgb(218 20 20/20%)";
@color-shadow:            ~"rgb(0 0 0/15%)";
```

9. Remove Google Fonts `@import` statement from `public/static/all.less`

```css
@import url("https://fonts.googleapis.com/css?family=Roboto:300,600|Open Sans:300,600&display=swap&subset=cyrillic");
```

10. Remove all instances of query string (?queryParam) added inside `.less` files, for example

`fonts/iconsOpenL.eot?id0mra` to `fonts/iconsOpenL.eot`

11. Modify this at the top of `all.less` (or remove commented section)
```less
// todo: fix temporary hack for OpenL icons because `policy-benefits-application` 'infra.config.js' has broken webpack config
//@font-face {
////    font-family: iconsOpenL;
////    src: url(fonts/iconsOpenL.eot);
////    src: url(fonts/iconsOpenL.eot) format('embedded-opentype'), url(fonts/iconsOpenL.ttf) format('truetype'),
////        url(fonts/iconsOpenL.woff) format('woff'), url(fonts/iconsOpenL.svg) format('svg');
////    font-weight: 400;
////    font-style: normal;
////    font-display: block;
////}
.ui-render i[class*=' icon-'],
.ui-render i[class^='icon-'] {
  font-family: iconsOpenL !important;
  speak: never;
  font-style: normal;
  font-weight: 400;
  font-variant: normal;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

12. Move `semantic.less` and `all.less` files to `/repos/policy/dist/static` and duplicate to `semantic.css` and `all.css`.

13. Rename `chunk` and `main` files inside `./dist/static/js` to remove hash for example: `1.94a8b9f9.chunk.js` to `chunk.js` and move them to `./dist/static` folder.    

14. Create `./dist/static/loader.js` file with the `<script>` content of `index.html`
