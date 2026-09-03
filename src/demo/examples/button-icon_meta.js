const buttonIconMeta = {
  view: 'Button',
  // The `tooltip` attribute is one of the three meta entry points into `TooltipPop`, and until now
  // NO tracked example rendered any of them: the corpus's only `tooltip:` and only
  // `view: 'Tooltip'` both sit in the `Factors` tab of `_meta.js`, which is an inactive `Tabs`
  // panel. So the browser leg (e2e/, docs/UPGRADE-PLAN.md §9.5) had nothing to point at on a
  // freshly loaded page. This makes one reachable in a single step, on a small example whose
  // ancestry is shallow — the deep, `overflow: hidden`-laden ancestry that only the `all` example
  // has is still driven, by e2e/corpus.tooltip.pw.js, because clipping is measurable only there.
  //
  // It moves no pinned count, and that is a measured claim rather than a hope: a CLOSED tooltip
  // adds nothing whatsoever to the document — `TooltipPop.test.js` pins the trigger as
  // byte-for-byte identical, no node in `document.body` and no attribute on the trigger — so the
  // DOM baseline, the role census, the bound-name count and the nameless-control count are all
  // unchanged. `META_ATTRIBUTES` in scripts/wrapper-prop-curation.js is keyed by WRAPPED view
  // (Table / Tooltip / Select / Dropdown) and `Button` is not one, so `docs:props` is unaffected
  // too. Putting the same line on a Select or a Table node would NOT have been free.
  tooltip: 'Open popup',
  items: [
    {
      view: 'Icon',
      name: 'trash'
    },
  ],
  onClick: 'popup'
}

export default buttonIconMeta
