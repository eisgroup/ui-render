/**
 * Scopes every rule under `.ui-render`, which since the §9.9-H8 decision (2026-09-11) means EVERY
 * rule: the published stylesheet must not touch the host page at all, only its own wrapper.
 *
 * `html`, `body` and `*` used to be exempt here, so a host that merely loaded `static/all.css`
 * received `display:flex` and `flex:1` on its `<body>`, `margin:0`, our background colour and base
 * font, and `box-sizing` on its `<html>` — 11 rules in all. `scripts/build-css.js` never carried
 * those exemptions, so the two pipelines disagreed by design while the decision was open; they are
 * identical now, and `src/style/__tests__/css.pipeline.parity.test.js` asserts that.
 *
 * WHAT THE OPTIONS ACTUALLY DO, measured rather than assumed, because the naming misleads:
 * with the exemptions gone, `body { … }` becomes `.ui-render { … }` — the declarations land on our
 * own root box, which is what they were always for. Adding prefixwrap's `prefixRootTags: true`
 * instead produces `.ui-render .body { … }`, a CLASS selector matching nothing, which silently
 * drops those styles. Do not "fix" this by turning that option on.
 *
 * `.ui-render-*` stays exempt: `rc-picker` renders its dropdown into a portal outside the wrapper,
 * so those rules have to be global to reach it.
 */
module.exports = {
    plugins: [
        require('postcss-prefixwrap')('.ui-render', {ignoredSelectors: [/^\.ui-render-(.+)$/]})
    ]
}
