/**
 * THE ONE PLACE THAT SAYS HOW THIS PROJECT COMPILES LESS.
 *
 * Ten sites used to set `javascriptEnabled: true` and a plugin list independently — three webpack
 * configs, `build-css.js`, and the CSS test suites. That is the shape that already bit us once:
 * the `theme.config` copy existed in two implementations and a third was about to be written when
 * the difference surfaced on CI. One module, imported everywhere, cannot drift.
 *
 * WHY `math: 'always'`. LESS 4 changed the default to `parens-division`, where `/` outside
 * parentheses is not division. `_variables.less:236` reads `size(round(@size-base-px * 1/4))`, and
 * under the new default `1/4` stops being a quotient, so `round` receives something that is not a
 * number and the compile dies. `always` is LESS 3's behaviour, and it is what keeps the output
 * identical — verified byte for byte across the two majors before the bump.
 *
 * NO `javascriptEnabled`, as Less 5 will have it: inline JavaScript fails the compile. The sources had
 * two backtick expressions until 2026-10-08, both ours rather than Semantic's: `_variables.less`'s
 * `@version: \`Math.random()\``, a cache-buster for the font URLs `.font-face` writes, which no active
 * call reached, and the rem factor of `_mixins.less`'s `.font-size`, now mixin guards. Every compiled
 * output stayed byte-identical.
 */
const LessPluginFunctions = require('less-plugin-functions');
const { less4Compatibility } = require('./less-plugin-compat.js');

/**
 * THE NODE BUILD, REQUIRED EXPLICITLY — do not change this to `require('less')`.
 *
 * LESS 4's manifest carries a `browser` field pointing at `dist/less.js`, and jest's `jsdom`
 * environment resolves it. The CSS suites then got the BROWSER build, which fetches `@import`s over
 * XHR: four suites failed with a jsdom `AggregateError` from a socket, which looks nothing like a
 * LESS problem and cost a detour to trace. LESS 3 had no such field, so this is new with the bump.
 *
 * `dist/less-node.cjs` is a published entry point in the package's `exports` map, not an internal
 * path, so this is a supported way to ask for the node build.
 */
const less = require('less/dist/less-node.cjs');

/** Plugins, in order. The compatibility shim must come FIRST — see its own file for why. */
function plugins () {
    return [less4Compatibility, new LessPluginFunctions()];
}

/** The options every LESS compile in this repository uses. Spread it, then add `filename`/`paths`. */
function lessOptions (extra = {}) {
    return { math: 'always', plugins: plugins(), ...extra };
}

module.exports = { lessOptions, plugins, less };
