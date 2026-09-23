/**
 * THE ONE PLACE the prefixwrap scoping is defined (§9.9-H7).
 *
 * Two pipelines wrap the CSS under `.ui-render`: the webpack build via the root `postcss.config.js`,
 * and the standalone `scripts/build-css.js`. They used to carry separate copies of these options and
 * DELIBERATELY disagreed — the webpack side exempted `html`, `body` and `*` while the standalone side
 * did not, which is the leak §9.9-H8 closed on 2026-09-11. Since that decision they have been
 * identical, and two identical copies of a security-shaped setting is a drift waiting to happen.
 *
 * `src/style/__tests__/css.pipeline.parity.test.js` still compares the two pipelines by RUNNING both
 * over the same probe rather than by comparing these values. That is deliberate and should stay:
 * sharing the options makes them equal by construction, but only executing both proves the two
 * pipelines actually apply them the same way.
 *
 * `.ui-render-*` stays exempt because `rc-picker` renders its dropdown into a portal OUTSIDE the
 * wrapper, so those rules have to be global to reach it.
 */
const PREFIX = '.ui-render'
const PREFIXWRAP_OPTIONS = { ignoredSelectors: [/^\.ui-render-(.+)$/] }

module.exports = { PREFIX, PREFIXWRAP_OPTIONS }
