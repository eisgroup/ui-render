<!--
  GENERATED FILE — DO NOT EDIT. Run `npm run docs:props` to regenerate.
  Inventories are derived from the component source, `domProps.js` and the call sites;
  the prose comes from scripts/wrapper-prop-curation.js. Generator: scripts/generate-wrapper-prop-reference.js.
-->

# Supported props — `Table`, `Tooltip`, `Select` / `Dropdown`

Companion to `docs/SUPPORTED-VIEWS.md`, which lists every `view` name a meta may use. This page
covers the props of the three views the `semantic-ui-react` exit replaces one at a time
(UPGRADE-PLAN §9.7-F1). It is both the **supported-prop list** for meta authors and the
**parity checklist** the replacements are judged against.

**1 of the 3 done so far.**
`Table` is in-house and
imports nothing; `TooltipPop`, `Dropdown`
still wrap semantic-ui-react. The two kinds of section answer different
questions, so they are shaped differently: a wrapper section ends in the **forwarded** table
that its replacement owes, while an in-house section says what the component **emits** and
what it no longer **accepts**.

**This page is generated.** Editing it by hand is pointless — the contract test regenerates
it and fails on any difference. Run `npm run docs:props` after changing one of these
components, and edit prose in `scripts/wrapper-prop-curation.js`.

## The outcomes, and why they are not one list

"A prop appears in a meta" is not "a prop reaches semantic-ui-react". Each prop on one of
these views has exactly one of these fates, and they are different promises:

| Outcome | What it means | What the §9.7-F1 swap does to it |
| --- | --- | --- |
| **consumed** | the component, or its caller in the engine, reads it | nothing — we already own the behaviour |
| **stripped** | removed at the DOM boundary by `src/core/components/domProps.js` | only the boundary moves |
| **forwarded** | handed to semantic-ui-react, which decides what happens | everything: this is the parity risk |
| **dropped** | semantic-ui-react handled it; the in-house component deliberately does not | already happened — this is the semver record for that step |

A checklist that mixed them would be full of props that never mattered. Each section below
is split that way.

The forwarded set is tiered, because "supported" and "used" are different facts:

- **tier 1 — exercised.** Used by a node in the tracked example corpus, by one of the
  consumer metas audited in step 0, or generated unconditionally by the wrapper. A
  regression here is a live bug.
- **tier 2 — published but unexercised.** Reachable through the wrapper API or by
  passthrough, but no meta in either corpus uses it. These cannot be dropped *silently* —
  they are documented propTypes — but reimplement-vs-deprecate is a decision for the step
  PR, not an automatic obligation.

## Isolation invariant

Everything semantic-ui-react does in this library happens inside `src/core/components`. Derived by
scanning `src` for every import, `require` and `jest.mock` of the package — so this table
shrinks as the exit proceeds, and the components below that no longer appear in it are the
ones that no longer depend on the package at all:

| File | How | Specifier |
| --- | --- | --- |
| `src/core/components/__tests__/Dropdown.behavior.test.js` *(test)* | `import` | `semantic-ui-react` |
| `src/core/components/__tests__/Dropdown.behavior.test.js` *(test)* | `jest.mock` | `semantic-ui-react` |
| `src/core/components/Dropdown.js` | `import` | `semantic-ui-react` |
| `src/core/components/TooltipPop.js` | `import` | `semantic-ui-react` |

An `eslint` `no-restricted-imports` override (in `package.json`, `eslintConfig.overrides`)
fails `npm run lint:js` on a static `import` of the package from anywhere outside `src/core/components`,
including deep imports such as `semantic-ui-react/dist/...`. A static import is *all* it sees:
it cannot see `require()`, `jest.mock()`, or a dynamic `import('semantic-ui-react')` — ESLint 8
does not visit `ImportExpression`. Nor does `lint:js` visit `.ts`/`.tsx` today, since it runs with
`--ext .js,.jsx`; the override glob already covers them for when it does.

The scan above closes every one of those gaps — dynamic imports, double-quoted specifiers and
TypeScript files included — which is why both halves run; 1 of the sites above is invisible to the rule. Neither is sufficient alone.

## In-house — the exit, so far

### `Table` — in-house, no semantic-ui-react

`src/core/components/Table.js`, 155 lines. Replaced the wrapper in §9.7-F1 step 1.

Seven components over the seven native table elements — markup and className composition, which is all `semantic-ui-react` was contributing here. Semantic's own table CSS is not loaded (`collections/table` is commented out in `src/style/override/_semantic.less`), so every table style in the product was already in-house LESS and the swap changed no styling.

**What it emits.** The root always emits `ui <modifiers> table <className>` — `ui` first, `table` second-to-last, the caller's `className` last. The six subcomponents emit the caller's `className` and nothing else.

| Component | Element | Notes |
| --- | --- | --- |
| `Table.Header` | `<thead>` | Rendered unconditionally by `TableView`, and empty in the five `vertical` tables — an empty `<thead>` must still render, because the behaviour contract counts `rowgroup: 2` per table. |
| `Table.HeaderCell` | `<th>` | Rendered as `th` wherever it sits. The `vertical` layout puts header cells inside `<tbody>`, which both `table.no-header.vertical > tbody > tr > th` and the role census (`columnheader`) depend on. No `scope` is added: `scope="row"` would reclassify those cells as `rowheader`. |
| `Table.Row` | `<tr>` | Takes the meta `itemClassNames` result, which is `undefined` for every row in the tracked corpus. |
| `Table.Cell` | `<td>` | The one boundary that matters: `mapper.js:184` spreads a `TableCells` node's whole rest bag onto it, so this is where `ENGINE_PROPS` and `FIELD_ONLY_PROPS` are applied. |
| `Table.Body` | `<tbody>` | Also rendered unconditionally, including when the table has no rows. |
| `Table.Footer` | `<tfoot>` | Part of the API and never used: zero `<tfoot>` in the 38-example baseline and no call site in `src`. |

CSS contract: `src/style/components/table.less` hangs EVERY cell's padding off `.ui.table` (`.ui.table td > :not(.button)` / `th > :not(.button)`), so the root has to keep emitting both tokens even though nothing "semantic" is loaded any more: drop either and every table in the product loses its cell padding. `table:not(.as-layout).inverted` and `table.striped tr:nth-child(2n)` are why `inverted`/`striped` survived as props. The element names and the `table > thead|tbody > tr > th|td` nesting are load-bearing too — the border-radius rules and `table.no-header.vertical > tbody > tr > th` select on structure, not on classes.

**Consumed by the root (3).** Read by `Table` itself; everything else rides the rest spread onto the element.

| Prop | Meaning |
| --- | --- |
| `className` | Appended last, after `table`. `TableView` builds it from the meta `styles`/`fill`/`vertical` attributes; consumer metas add `as-layout`, `no-header`, `highlight-N-last` and the sticky-column tokens through the same channel. |
| `inverted` | Dark table. Emitted as the `inverted` class, which `table.less` and `expand.less` both select on. Reached only from `ErrorTable.js` — a §9.9-H1 orphan, so the prop is kept but its fate is that deletion's to decide, not this step's. |
| `striped` | Zebra rows, emitted as the `striped` class. Same single call site as `inverted`, and also genuinely styled — which is why neither was dropped with the rest. |

**Consumed by every subcomponent (1).** All six share one implementation, so this list applies to each of them identically.

| Prop | Meaning |
| --- | --- |
| `className` | Passed through verbatim, or the attribute is omitted entirely when it is absent or empty. Semantic ran its own `cx()` and printed `class=""` regardless: 317 empty class attributes in the 38-example baseline were its, on `tbody` (24), `tr` (94) and `td` (199), and they are gone. |

**Stripped at the DOM boundary.** `src/core/components/Table.js` applies `ENGINE_PROPS`, `FIELD_ONLY_PROPS` from `src/core/components/domProps.js` in all 7 components, so these never become attributes: `view`, `index`, `data`, `_data`, `symbol`, `_comment`, `expanded`, `translate`, `onDataChanged`, `currencyCode`, `name`, `label`.

**Passthrough.** `style`, `colSpan`, `scope`, `id`, `data-*` and every event handler still reach the element untouched — they always did, because Semantic did not handle them either, so they ride the rest spread exactly as before. There is no `forwardRef`: nothing in `src` passes a ref to a table element, so the parameter would have had no caller.

**Dropped (4) — the semver record.** Props semantic-ui-react handled that this implementation deliberately does not. All of them remain REACHABLE from a consumer meta — `mapper.js` spreads a `TableCells` node's whole rest bag onto the cell and `TableView` spreads its own rest onto the table — so the component strips them explicitly and warns once per prop in development. Stripping matters because a string-valued one would otherwise land as a lowercase DOM attribute (`verticalAlign="top"` rendered `verticalalign="top"`), which is the junk the DOM contract's tripwires exist to keep out; warning matters because a meta still carrying one would otherwise never learn it stopped working. React's own unknown-prop warning is not relied on: it is silent for a lowercase name.

| Prop | Why it is gone |
| --- | --- |
| `verticalAlign` | Was accepted on the cell and turned into the classes `top aligned`. NO loaded CSS selects on `aligned` (0 occurrences in `static/all.css` and in `src/style`), and no `.top` rule can match either — every one of them needs a second class on the same element — so the 15 cells that asked for it rendered at the `<td>` default anyway. Both call sites (`LocalDraftTableRow`) were removed with the prop. A cell that must align does it with `style={{verticalAlign}}`, which is what the metas that actually align already use. |
| `as` | Element override. No call site, no meta occurrence; the element per component is now fixed, which is what the structural CSS selectors assume anyway. |
| `celled` | Semantic border modifier. Emitted a class no loaded CSS selects on, so it was inert markup even when passed — and nothing passed it. |
| `textAlign` | Emitted `<value> aligned`, the same dead token family as `verticalAlign`. Use a `className` or a `style`. |

Those four were the *published* ones — they had curated entries on this page while it was a wrapper. Semantic's `Table` handled 29 props and its `Table.Cell` 17, and the rest of that surface was reachable only by passthrough and never documented here: `collapsing`, `color`, `columns`, `compact`, `definition`, `fixed`, `padded`, `attached`, `basic`, `selectable`, `singleLine`, `size`, `sortable`, `stackable`, `structured`, `unstackable`, `width`, `fullWidth`, `sorted`, the row/cell state modifiers (`active`/`disabled`/`error`/`negative`/`positive`/`warning`), the `content`/`icon` shorthands, `cells`/`cellAs`, and the nil-children shorthand engine (`headerRow`/`headerRows`/`renderBodyRow`/`tableData`/`footerRow`). None occurs in either corpus and none is selected by loaded CSS. Step 5 records the semver call for the whole set; on the evidence here it is minor.

**Call sites.** What the codebase puts on the family, derived from the source. This was the step-1 parity surface and it is kept afterwards, because it is what any future change to the family is measured against:

| Component | Attributes at the call sites | Spreads | Rendered by |
| --- | --- | --- | --- |
| `Table` | `className`, `inverted`, `striped` | `...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)`, `...props` | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.Header` | `className` | — | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.HeaderCell` | `className`, `colSpan`, `key`, `style` | — | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.Row` | `className`, `key` | — | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.Cell` | `className`, `colSpan`, `key`, `scope`, `style` | `...rest` | `core/components/ErrorTable.js`, `core/pages/main/components/LocalDraftTableRow.js`, `core/pages/main/components/TableView.js`, `core/pages/main/mapper.js` |
| `Table.Body` | — | — | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.Footer` | — | — | *nothing* |

`mapper.js`'s spread onto `Table.Cell` is a meta node's whole rest bag and is still unfiltered at the call site — the filter is now inside the cell, which is why it is safe. The remaining unfiltered boundary on this surface is the tooltip wrapper, and step 2 owns it.

## Wrappers — what is left

### `TooltipPop` — wraps semantic-ui-react `Popup`

`src/core/components/TooltipPop.js`, 24 lines.

Hover tooltip over SUIR `Popup`. Reached TWO live ways: a `view: "Tooltip"` node (`mapper.js`, which maps `label` to `content`), the `tooltip` attribute on ANY node (`Render.js`, which wraps the rendered node and spreads `tooltip` when it is an object — so an object `tooltip` is an unfiltered passthrough into SUIR). A third import exists but is NOT a way of reaching the component: `modules/form/utils.js` imports it as the default of `withForm`'s `Tooltip` parameter, which is passed into `withFormSetup`, destructured there and never used — a dead chain across four sites (import, default, pass-through, destructure), all removable together. Not to be confused with the IN-HOUSE `Tooltip` the same file imports as `ToolTip` and does use. §9.7-F1 step 2 part 1 measured the whole surface and built the gate; the replacement itself is still open. THE FORWARDED TABLE BELOW IS A CURATED SUBSET, NOT THE SURFACE: because the rest spread lands last, a caller reaches `Popup.handledProps` ∪ `Portal.handledProps` = 45 names, 16 of them Portal-only and absent from `Popup`'s propTypes entirely (`closeOnPortalMouseLeave`, `closeOnTrigger*`, `openOnTrigger*`, `eventPool`, `triggerRef`, …). Of the 24 passthrough rows listed, 16 have an effect asserted by a test and 8 are documented from the SUIR source without one — two of those (`pinned`, `offset`) are browser-only and say so in their own row, so a jsdom assertion for them is not possible. A replacement that accepts four props narrows the meta contract by 41.

**What it emits.** `ui <resolved placement> [size] [very] [wide] [basic] [flowing] [inverted] popup transition visible <className>`, in that order, caller `className` last. From both engine entry points that is exactly `ui top left inverted popup transition visible`. The placement words are Popper's RESOLVED placement rather than the requested one, so a flip rewrites them — which jsdom cannot observe (§9.5). Body markup is `portal div > popper wrapper div > bubble > .content`, and the `.content` wrapper is NOT invariant: it appears for a string or number body and NOT for an element or a function body. Closed, the component renders the trigger byte-for-byte as it renders without a tooltip and adds nothing to `document.body`, which is why the 38-example DOM baseline is blind to tooltips by construction.

**What opens and closes it.** Opens on hover after 500 ms and ALSO on a single click, instantly; does not open on focus. Closes 70 ms after the pointer leaves, on a second click, on a click anywhere else in the document, and on Escape — but NOT on a click inside the bubble. Leaving before 500 ms cancels the pending open. The pointer moving from the trigger onto the bubble still closes it, because `hoverable` is unset, so the text cannot be hovered or selected. No ARIA anywhere: no `role="tooltip"`, no `aria-describedby`, no `id` on the bubble, no `tabindex` added to the trigger. The trigger must be EXACTLY ONE element (`React.Children.only`), so the `items` form of `view: "Tooltip"` throws and the engine renders its error diagnostic in the node's place. Measured identically on React 16.14, 17.0.2 and 18.3; pinned by `components/__tests__/TooltipPop.behavior.test.js` and `UIRender.overlay-behavior.test.js`.

**Consumed by the wrapper (4).** These never reach semantic-ui-react — we own the behaviour, and the §9.7-F1 swap cannot change it.

| Prop | Meaning |
| --- | --- |
| `title` | The tooltip body. Forwarded as SUIR `content`, and OVERRIDDEN by a caller-supplied `content` because the rest spread lands last. A function value is wrapped as `{children: fn}` — the workaround for Semantic-Org/Semantic-UI-React#4029 — and is called, with its result rendered directly and no `.content` wrapper. |
| `children` | The trigger element, forwarded as SUIR `trigger`. Must be exactly one element: two children, a text child, or an ARRAY of one all throw inside SUIR's `Portal`. SUIR clones it with `onBlur/onClick/onFocus/onMouseEnter/onMouseLeave/ref`, and the trigger's own handlers still fire. |
| `delay` <br>*(has a default)* | Milliseconds before the tooltip opens; default 500, deliberately slower than Semantic's own 50 ms. Forwarded as `mouseEnterDelay`, and it does win — the wrapper's spread lands after `Popup`'s portal defaults. It gates the HOVER path only: a click opens the tooltip with no delay at all. |
| `inverted` | Dark colour scheme. Intercepted and re-passed under the same name, so it also reaches the emitted className. Always true from both entry points, and it is what selects 6 of the 13 scoped CSS rules (the whole colour scheme plus our own border override). |

`inverted` is also written back onto the semantic-ui-react element under the same name, so the same prop appears in both tables.

**Stripped at the DOM boundary.** `src/core/components/TooltipPop.js` applies no boundary filter. Whatever the caller passes reaches semantic-ui-react, which spreads what it does not recognise onto a DOM element — so this is an unprotected boundary, and the replacement should apply `omitProps` where the current wrapper does not.

**Forwarded to semantic-ui-react (28) — the parity checklist.** The wrapper writes `inverted`, `trigger`, `content`, `mouseEnterDelay` as explicit attributes, and spreads `props` AFTER them — so a caller CAN override what the wrapper wrote.

CSS contract: MEASURED, AND IT CONTRADICTS THE STEP-2 INSTRUCTION: **no `.ui.popup` rule applies today.** The loaded `modules/popup` LESS contributes 13 declaration blocks that select this exact class string, plus 6 placement-keyed `:before` rules for the arrow, but prefixwrap scopes every one of them under `.ui-render` — a `<div>` — while SUIR's `PortalInner` mounts the bubble into `document.body`, outside it. The live tooltip is therefore unstyled text positioned by Popper, reached only by the two unscoped `*` rules the §2.6-7 host leak already documents. So "keep emitting `ui popup` classNames until step 4 so the current CSS continues to apply" preserves nothing; what revives those 13 rules is mounting INSIDE the widget, which SUIR's own `mountNode` already does. Pinned both ways — matching under `.ui-render`, matching nothing where the portal lands today — by `src/style/__tests__/css.tooltip-contract.test.js`.

| Prop | Reaches SUIR via | Tier | Seen in | What has to be reproduced |
| --- | --- | --- | --- | --- |
| `content` | element | 1 | demo | The tooltip body, from `title`. `mapper.js` maps a `view: "Tooltip"` node's `label` to `content` directly, so on that path `content` arrives through the rest spread and wins over `title`. |
| `inverted` | element | 1 | demo | Always set from both entry points. Adds `inverted` to the popup className. |
| `mouseEnterDelay` | element | 1 | demo | From `delay`. SUIR does not declare it on `Popup`, only on `Portal`, and the wrapper's spread lands after the portal defaults — so the 500 ms does take effect. |
| `trigger` | element | 1 | demo | The element the tooltip hangs off. Comes from `children`; a caller may override it through the rest spread, which is spread last. |
| `as` | caller, via `props` | 2 | — | Changes the bubble's element (`div` → `span`, …). No occurrences. |
| `basic` | caller, via `props` | 2 | — | Borderless style; `.ui.basic.popup:before {display}` removes the arrow. No occurrences. |
| `className` | caller, via `props` | 2 | — | Appended AFTER `visible`, so a caller can add tokens but never reorder the ones the CSS keys on. No occurrences. |
| `closeOnDocumentClick` | caller, via `props` | 2 | — | Set true by SUIR's click branch, which is why a click anywhere else dismisses the tooltip. Portal-only. No occurrences. |
| `closeOnEscape` | caller, via `props` | 2 | — | Default true, delivered through a document-level `keydown` listener — so Escape works with focus on an unrelated element, and it is the only dismissal path that needs no pointer. Portal-only. No occurrences. |
| `defaultOpen` | caller, via `props` | 2 | — | Open on mount, uncontrolled. Portal-only, same caveat as `open`. No occurrences. |
| `disabled` | caller, via `props` | 2 | — | Renders the trigger and no portal at all. No occurrences. |
| `flowing` | caller, via `props` | 2 | — | Drops the 250 px max-width. No occurrences. |
| `header` | caller, via `props` | 2 | — | Bold heading above the body. The ONLY way the inner `.content` node acquires any style — `.ui.popup > .header + .content {padding-top}` is the single rule that selects it, and it needs this sibling. No occurrences. |
| `hideOnScroll` | caller, via `props` | 2 | — | Closes on window scroll, and the only prop that makes SUIR render an extra `EventStack` inside the bubble. No occurrences. |
| `hoverable` | caller, via `props` | 2 | — | Keeps the popup open while the pointer is over it. Unset today, which is why moving onto the bubble closes it and its text cannot be selected. No occurrences. |
| `mountNode` | caller, via `props` | 2 | — | Redirects the whole portal into a given node — verified. This is the prop that would put the bubble inside `.ui-render` and make the 13 scoped CSS rules apply, so step 2 should read it as the shape of the fix rather than as an unused option. No occurrences. |
| `mouseLeaveDelay` | caller, via `props` | 2 | — | The close delay, 70 ms by default — the wrapper exposes `delay` for the open side only, so this is the half a meta author cannot reach without an object `tooltip`. Portal-only. No occurrences. |
| `offset` | caller, via `props` | 2 | — | Offsets the bubble AND is what switches on Popper's `preventOverflow` (`enabled: !!offset`). Nothing sets it, so overflow clamping is OFF today — which means parity for a replacement is flip yes, shift no. Browser-only. |
| `on` | caller, via `props` | 2 | — | Trigger events, SUIR default `['click', 'hover']` — so today's tooltip also opens on CLICK and does NOT open on focus. Verified that `['hover', 'focus']` fixes the keyboard gap immediately, so step 2's a11y work here is configuration, not new code. |
| `onClose` | caller, via `props` | 2 | — | Called when it closes, once per close. No occurrences. |
| `onOpen` | caller, via `props` | 2 | — | Called when the overlay opens. Fires on every path, including the click one. No occurrences. |
| `open` | caller, via `props` | 2 | — | Fully controlled overlay. A Portal-only prop: it appears in no `Popup` propTypes, so a reader of the Popup documentation would not know it works. No occurrences. |
| `pinned` | caller, via `props` | 2 | — | Disables Popper's flip, which is ENABLED today (`enabled: !pinned`). Browser-only: jsdom reports 0×0 for every rect, so no jest test can observe a flip — named as a gap in §9.5. |
| `popper` | caller, via `props` | 2 | — | Props, className or id for the positioning wrapper `<div>` — the element that actually carries the coordinates. No occurrences. |
| `position` | caller, via `props` | 2 | — | Placement, SUIR default `top left`. Rewrites the placement tokens, so it also decides which arrow rule applies. No meta in either corpus passes it — zero occurrences of `position` on any tooltip node — and the only code that configures it (`components/utils/components.js`) has no non-test importer, so `top left` is the only placement in production. |
| `size` | caller, via `props` | 2 | — | One of `mini`…`huge`, inserted as a token before `popup`; five scoped rules select on it. No occurrences. |
| `style` | caller, via `props` | 2 | — | Merged after the `left`/`right`/`position` SUIR writes inline, so a caller can override the positioning reset. No occurrences. |
| `wide` | caller, via `props` | 2 | — | Widens the box; `wide: 'very'` emits `very wide`. Both tokens are styled. No occurrences. |

### `Dropdown` — wraps semantic-ui-react `Dropdown`

`src/core/components/Dropdown.js`, 291 lines.

The wrapper already owns the external API: the `onChange(value, name, event)` signature, option sanitisation, case-insensitive dedup on addition, and the cascading reset are all wrapper code and are keepers. Only the `<DropDown/>` element at the bottom is replaced. Two entry points, and they differ: `mapper.js` imports the memoised default export for `view: "Dropdown"`, while `modules/form/inputs/DropdownField.js` imports the NAMED export for `view: "Select"` — which is the majority path.

**Consumed by the wrapper (23).** These never reach semantic-ui-react — we own the behaviour, and the §9.7-F1 swap cannot change it.

| Prop | Meaning |
| --- | --- |
| `options` <br>*(bound as `opts`)* | Option list: strings, numbers, or `{text, value, key, content, disabled}` objects. Sanitised into a fresh array (translation, `value`-from-`text` defaulting, `optionsLabel` appended) and held in wrapper state so additions can extend it. The array SUIR receives is never the array the caller passed. |
| `onChange` | Called as `onChange(value, name, event)` — the wrapper's own signature, not Semantic's `(event, data)`. Also where case-insensitive duplicate collapsing happens. |
| `onSelect` | Called on close with the last committed value, same `(value, name, event)` shape. Implemented by handing SUIR an `onClose`. |
| `onSearch` | Called with the typed query, `(query, name, event)`. Implemented by handing SUIR an `onSearchChange`. |
| `label` | Visible label text, rendered by the wrapper as its own `<Text>` before or after the control depending on `float`. CONSUMED, not stripped: it is destructured out at the top of the wrapper, so it can never be in the rest bag that `omitProps` filters. |
| `placeholder` <br>*(has a default)* | Placeholder text, translated by the wrapper and then forwarded to SUIR. |
| `done` | Adds a `done` class to the wrapper. Defaulted from `props.value` — which is always `undefined`, because `value` was destructured out, so the class is unreachable from a value today. Do not port the defaulting faithfully; fix it or drop it. |
| `error` | Message shown under the control. The wrapper renders the text itself and forwards only `error={!!error}` to SUIR for the class. |
| `info` | Explanatory message under the control. Also adds an `info` class. |
| `float` | Renders the label after the control (float-label layout). |
| `className` | Composed by the wrapper onto its own `input--wrapper` element; only the derived `{info, readonly}` classes go to SUIR. |
| `classNameIcon` | Class for the icon node the wrapper builds when `onClickIcon` is given. |
| `style` | Inline style, applied to the wrapper element, not to SUIR. |
| `fill` <br>*(has a default)* | Adds `fill-width` unless `compact`. Default true. |
| `lazyLoad` <br>*(has a default)* | Defer rendering options until opened; default true, and `mapper.js` passes false on the `view: "Dropdown"` path. Forwarded to SUIR unchanged. |
| `optionsLabel` | Extra disabled option appended to the bottom of the list. |
| `initialValues` | Accepted and discarded — it exists only to keep the form stack's `initialValues` off the DOM. |
| `readonly` | Translated to SUIR `disabled` plus a `readonly` class, because Semantic's Dropdown has no `readOnly`. |
| `autofocus` | Translated to SUIR `searchInput={{autoFocus: true}}`, so it only does anything together with `search`. |
| `onAddItem` | Called when a new option is added, `(value, name, event)`. Requires `allowAdditions`; the wrapper dedups against existing options first. |
| `onClickIcon` | Replaces the icon with a clickable `<Icon>` node, because Semantic has no icon-click callback. |
| `translate` <br>*(has a default)* | The i18n function. Engine-owned, applied to option text, `label` and `placeholder`. CONSUMED, not stripped — destructured out at the top of the wrapper. It is also in ENGINE_PROPS, which is what catches it at other boundaries. |
| `value` <br>*(bound as `valueFromParent`)* | Selected value. Held in wrapper state, synced from the prop, and array values are joined before being forwarded — so what SUIR sees is not always what the caller passed. |

`options`, `placeholder`, `error`, `className`, `lazyLoad`, `value` are also written back onto the semantic-ui-react element under the same name, so the same prop appears in both tables.

**Stripped at the DOM boundary.** `src/core/components/Dropdown.js` applies `ENGINE_PROPS`, `FIELD_ONLY_PROPS` from `src/core/components/domProps.js` to the rest bag, so these never become attributes: `view`, `index`, `data`, `_data`, `symbol`, `_comment`, `expanded`, `translate`, `onDataChanged`, `currencyCode`, `name`, `label`. `name` is the interesting one: SUIR declares no `name` and renders no hidden native input, so stripping it costs nothing on the DOM — but it is still what `onChange(value, name, event)` reports and what react-final-form registers the field under, and the strip deliberately happens AFTER the handler closures are built.

**Forwarded to semantic-ui-react (30) — the parity checklist.** The wrapper writes `className`, `options`, `placeholder`, `error`, `lazyLoad`, `noResultsMessage`, `value` as explicit attributes, generates `additionLabel`, `additionPosition`, `deburr`, `disabled`, `icon`, `onAddItem`, `onChange`, `onClose`, `onSearchChange`, `searchInput`, `selection` onto the rest bag, and spreads `props` AFTER them — so a caller CAN override what the wrapper wrote.

CSS contract: The loaded `modules/dropdown` LESS is the largest single semantic module in the compiled CSS and is keyed almost entirely on `.ui.selection.dropdown`. SUIR builds that className from `ui`, the active/disabled/error/compact/multiple/search/selection/upward modifiers, then `dropdown`, then ours. Steps 3 and 4 are therefore more coupled for this component than the roadmap implies: in-house markup must keep emitting the modifier tokens until the CSS is re-homed.

| Prop | Reaches SUIR via | Tier | Seen in | What has to be reproduced |
| --- | --- | --- | --- | --- |
| `checked` | caller, via `props` | 1 | demo | A react-final-form artefact, also always `undefined`. Nothing to reproduce. |
| `className` | element | 1 | demo | Only the wrapper-derived `{info, readonly}` classes; the caller's `className` goes to the wrapper element instead. |
| `compact` | caller, via `props` | 1 | demo | Narrow control. Used by both corpora, and also suppresses the wrapper's `fill-width`. |
| `disabled` | generated | 1 | consumer | Set by the wrapper from `readonly`, and passed directly by consumer metas (`view: "Select"`). Adds the `disabled` class, which IS styled, and sets `tabIndex=-1`. |
| `error` | element | 1 | demo | Coerced to boolean; drives the `error` class only. |
| `id` | caller, via `props` | 1 | demo | Unhandled by SUIR, so it lands on the `<div role="listbox">`. |
| `lazyLoad` | element | 1 | demo | When true and closed, SUIR renders no options at all. Load-bearing for the initial DOM. |
| `noResultsMessage` | element | 1 | demo | Computed by the wrapper, but SUIR only renders it when `search` is on — so the `NO_OPTIONS_LEFT`/`NOTHING_FOUND` computation is dead in both corpora. Do not port it as a requirement. |
| `onBlur` | caller, via `props` | 1 | demo | Also from the form adapter. With SUIR's `selectOnBlur` default this participates in committing a value, so it is not merely a notification. |
| `onChange` | generated | 1 | demo | The wrapper's adapter, which is where the `(value, name, event)` signature and the duplicate collapsing live. SUIR calls it `(event, data)`. |
| `onFocus` | caller, via `props` | 1 | demo | Arrives from the react-final-form adapter on the `view: "Select"` path. |
| `options` | element | 1 | demo | The sanitised array. Always an array of `{text, value, ...}` objects by the time SUIR sees it. |
| `placeholder` | element | 1 | demo | Translated placeholder. |
| `selection` | generated | 1 | demo | Defaulted to true by the wrapper unless the caller says otherwise. This is what makes the className `ui selection dropdown`, which is what almost all the loaded dropdown CSS selects on. |
| `type` | caller, via `props` | 1 | demo | A react-final-form artefact that arrives as `undefined`, so no attribute is emitted. Nothing to reproduce; listed so a replacement is not surprised to receive it. |
| `upward` | caller, via `props` | 1 | consumer | Opens the menu upward. Consumer metas only — a demo-derived checklist misses it. It is an autoControlled prop in SUIR: left unset, SUIR measures viewport space and flips by itself, so a replacement owes both the prop AND the auto-flip. |
| `value` | element | 1 | demo | Wrapper state, with array values joined to a string. `selectOnNavigation` and `selectOnBlur` both default true in SUIR, which is the commit-as-you-move behaviour the contract suite pins. |
| `additionLabel` | generated | 2 | — | Set only under `allowAdditions`. |
| `additionPosition` | generated | 2 | — | Set only under `allowAdditions`. |
| `allowAdditions` | caller, via `props` | 2 | — | User-created options. No occurrences; gates a third of the wrapper's own logic. |
| `clearable` | caller, via `props` | 2 | — | Clear icon. No occurrences. |
| `deburr` | generated | 2 | — | Defaulted to true by the wrapper, but only when `search` is set — which nothing sets. |
| `icon` | generated | 2 | — | Replaced with a node only when `onClickIcon` is given. No occurrences. |
| `multiple` | caller, via `props` | 2 | — | Multi-select, rendered by SUIR as `ui label` chips. No occurrences on any Select/Dropdown node in either corpus. The wrapper has real `multiple` logic — dedup, array handling, `last()` semantics in `onChange` — which becomes unreachable code if the prop is dropped, so this decision is also a wrapper-cleanup decision. |
| `onAddItem` | generated | 2 | — | Set only under `allowAdditions`. No occurrences. |
| `onClose` | generated | 2 | — | Set only from `onSelect`. No occurrences in either corpus. |
| `onSearchChange` | generated | 2 | — | Set only from `onSearch`. No occurrences. |
| `required` | caller, via `props` | 2 | — | Read by the wrapper for its own `required` class and also forwarded. No occurrences on these views. |
| `search` | caller, via `props` | 2 | — | Type-to-filter combobox. §9.7-F1.1 called this "the real work" — but ZERO nodes in the 38 tracked examples and ZERO in the consumer metas set it. Same for `multiple`, `allowAdditions` and `clearable`. This is the single biggest scope datum in the step-0 audit. |
| `searchInput` | generated | 2 | — | Set only from `autofocus`. No occurrences. |

## What the meta corpus actually uses

Every attribute name the **tracked** example corpus puts on a node of each of these views.
This is the "discovered set" §9.7-F1 step 0 asked for, and it is enforced total in both
directions by `scripts/__tests__/wrapper-prop-reference.contract.test.js`: add an example
that uses a new attribute, and the test names it.

Read it as an inventory, not a forwarding claim — most of these are consumed by
`mapper.js` / `TableView.js` and never reach semantic-ui-react. Cross-reference the
per-wrapper tables above for the fate of each.

| View | Attributes in the tracked corpus | Found only in consumer metas |
| --- | --- | --- |
| `Dropdown` | `@class`, `compact`, `mapOptions`, `name`, `onChange`, `options`, `placeholder`, `style`, `styles`, `value`, `view` | — |
| `Select` | `compact`, `label`, `mapOptions`, `name`, `onChange`, `options`, `placeholder`, `styles`, `view` | `disabled`, `upward`, `validate` |
| `Table` | `@class`, `extraHeaders`, `extraItems`, `filterItems`, `group`, `headers`, `itemClassNames`, `itemsExpanded`, `name`, `relativeData`, `renderExtraItem`, `renderItem`, `renderItemCells`, `rowsPerPage`, `showIf`, `sorts`, `styles`, `usePagination`, `vertical`, `view` | `colGroup` |
| `Table headers[]` | `@class`, `className`, `classNameCell`, `classNameCellWrap`, `classNameHeader`, `id`, `label`, `renderCell`, `renderHeader`, `styleHeader` | `renderLabel` |
| `Tooltip` | `children`, `label`, `view` | — |

The last column is a step-0 audit finding, not a CI-checked fact: consumer metas are
untracked working files (UPGRADE-PLAN §0.8) and CI never sees them. It is recorded because
two of those props reach semantic-ui-react and are styled — a checklist derived from the
demo corpus alone would be wrong.

## Obligations per step

What each step owes beyond "the props above still work".

### Step 1 — `Table` — SHIPPED

**Effort: S, and it came in at the small end — the audit's estimate held.**

- SHIPPED: native `<table>/<thead>/<tbody>/<tfoot>/<tr>/<th>/<td>`, seven components, no `semantic-ui-react` import. The subcomponent API is unchanged, so no call site moved.
- DONE — the root still emits `ui` and `table`, in that position, and all 24 `<table>` class strings in the 38-example baseline are byte-identical. This was the highest-risk detail in the step and it is pinned by a unit test as well as by the snapshots.
- DONE — `omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)` is applied in all seven components, closing the `mapper.js:184` spread onto `Table.Cell`. Zero-diff on today's corpus (no example puts an engine prop on a `TableCells` node), so it is a latent-boundary net rather than a visible fix; `domProps.js` now names the family.
- DECIDED — `verticalAlign` DROPPED, and its two call sites in `LocalDraftTableRow` with it. SUIR emitted `top aligned`; no loaded CSS selects on `aligned`, and no `.top` rule can match a `<td class="top aligned">`, so those 15 cells already rendered at the `<td>` default. Pixel-identical, and it leaves one way to align a cell instead of two, one of which never worked.
- DECIDED — `inverted`/`striped` KEPT. They are the only SUIR modifiers any call site passes and, unlike `celled`, they ARE styled (`table:not(.as-layout).inverted`, `table.striped tr:nth-child(2n)`). §9.9-H1 still owns whether `ErrorTable`/`ErrorContent` survive; this step deliberately did not pre-empt that.
- DECIDED — `fixedHeader` DELETED with its test. Unused by every call site and every meta, AND non-functional: `app__table__container--fixed-header` and its inner class have zero occurrences in `static/all.css` and in `src/style`, so it rendered two unstyled `<div>`s. Keeping it would have meant reimplementing a feature that never worked.
- DONE — `jest.config.js` gained a per-file threshold for `Table.js` at 100/100/100/100, measured from a real `--coverage` run, alongside the existing `TableView.js` entry.
- DONE — `TableView.js`'s `sellStyles` discard is gone (a typo for a prop that does not exist; nothing passes `cellStyles` either), and the `class=""` comment it carried is rewritten, because suppressing that attribute is now the cell's job.
- EXPECTED AND VERIFIED — 332 changed snapshot lines in four shapes and no others: 24 `<tbody class="">`, 94 `<tr class="">` and 199 `<td class="">` lose an empty attribute, and 15 `<td class="top aligned">` lose a dead class. Nothing else moved: same element counts per tag, same class strings on `<table>`/`<thead>`/`<th>`, same `id`/`style`/`colspan`, same visible text, and the behavioural layer green throughout.

### Step 2 — `TooltipPop` — PART 1 (THE GATE) SHIPPED, REPLACEMENT OPEN

**Effort: S–M for the replacement, unchanged. Part 1 was the measurement and the gate..**

- SHIPPED — the gate. 63 tooltip tests across four files where there were 10, only 5 of which could fail if the tooltip broke (the other 5 asserted the props handed to a mock): `components/__tests__/TooltipPop.test.js` (rewritten against the REAL `semantic-ui-react`, no `jest.mock`), `components/__tests__/TooltipPop.behavior.test.js` (new — the interaction contract), `pages/main/__tests__/UIRender.overlay-behavior.test.js` (extended to all three meta entry points) and `style/__tests__/css.tooltip-contract.test.js` (new — joins the emitted class string to the compiled CSS rules). NOT SHIPPED: the replacement, and the positioning-primitive decision, which is the maintainers' and is deliberately still open.
- CORRECTION to the step-0 note above: the gate was never "the SUIR-mocked wrapper unit test" alone. `UIRender.overlay-behavior.test.js` already drove the real component through the real engine for 5 clauses (delay boundary, close on leave, delay override, two a11y tripwires). What was genuinely missing was everything markup-shaped: no class pin, no portal-location pin, no click path, no Escape, no click-outside, no close delay, no object-`tooltip` passthrough, no prop-leak boundary. Part 1 extended that file rather than founding it.
- CORRECTION to "the corpus renders zero tooltips": true of THIS component only. The corpus renders 5 tooltips today, all in the `slider` example and all snapshot-gated — they come from a second, separate `components/Tooltip.js`: 15 lines, CSS-only, an inline `<span>`, no portal and no JS positioning, used by `Slider`, `modules/upload/views/Upload.js` and `withFormSetup`'s validation-error tooltip, and styled by 41 rules in `style/components/tooltip.less`. It is evidence for the positioning decision and a naming trap for the cleanup: `form/utils.js` imports BOTH.
- CORRECTION — the biggest finding, and it invalidates an instruction this step was given: "keep emitting `ui popup`-compatible classNames so the current CSS continues to apply" rests on a false premise. No `.ui.popup` rule applies today, because the portal mounts outside `.ui-render`. See the CSS contract in the `TooltipPop` section above; measured twice, by selector matching and by real-Chrome computed style.
- STILL OWED — this is an unfiltered DOM boundary, and it is the one thing part 1 pinned as a DEFECT rather than as a contract: `view`, `index` and `symbol` all reach the bubble as HTML attributes today (`view="Tooltip"` on every `view: "Tooltip"` node, via the `mapper.js` spread). Apply `omitProps` in the replacement and flip that assertion to `toEqual([])`.
- STILL OWED — decide `on` explicitly. SUIR's default is `['click', 'hover']`, so every tooltip in the product is also a click target and none of them opens on focus. Part 1 verified that `['hover', 'focus']` closes the keyboard gap immediately, so this is a decision, not a workstream.
- STILL OWED — decide the trigger-shape contract. `React.Children.only` means the `items` form of `view: "Tooltip"` has never worked: the engine catches the throw and renders its error diagnostic in place of the node, so the author loses the trigger too. Pinned as current behaviour; `docs/SUPPORTED-VIEWS.md` is corrected.
- THE POSITIONING DECISION, with the data it needs. Requirements measured, not assumed: flip is ACTIVE today (`enabled: !pinned`, and the placement class carries Popper's resolved placement, so a flip is observable in the DOM); overflow clamping is OFF (`preventOverflow` is `enabled: !!offset` and nothing sets `offset`); the arrow is CSS `:before`, not a positioned element; and scroll/resize repositioning is on. So parity is **flip yes, shift no** — §9.7-F1.2's claim that the zero-dep option loses "flip AND overflow handling" is half right. Coordinates are unavoidable while the bubble portals out of the tree; an inline tooltip needs none (and the in-house `Tooltip.js` proves the pattern ships) but would be clipped at the corpus's own use sites, which sit inside `Expand` → `AnimateHeight`'s `overflow: hidden`. Neither option is ruled in; "no positioning code" and "inline only" are ruled out.
- WHAT THE GATE CANNOT SAY, so the replacement is not judged on it: everything positional. jsdom reports 0×0 for every rect, so flip, the resulting placement-class change, shift, the arrow geometry, the 250 px wrap, clipping, stacking, painted style, real pointer travel and screen-reader announcement are all inexpressible. They are named one by one against the §9.5 Playwright item, which now blocks THIS step's completion rather than only F1's.
- FREE CLEANUP, confirmed: the `TooltipPop` chain in `modules/form/utils.js` is dead at four sites — the import (line 8), `withForm`'s `Tooltip = TooltipPop` default parameter, the pass-through into `withFormSetup({… Tooltip})`, and the destructure that never uses it. Delete all four; do NOT touch line 7, which imports the in-house `Tooltip` as `ToolTip` and IS used by the validation-error tooltip.

### Step 3 — `Dropdown`

**Effort: L (unchanged size, different location).**

- The L is NOT in `search`/`multiple`/`allowAdditions`/`clearable` — nothing uses them. It is in the keyboard/a11y matrix, the cascading flows, `upward`'s auto-flip, and the `.ui.selection.dropdown` CSS contract.
- Keep `displayName = 'Dropdown'` AND the named-vs-default export split: `modules/form/utils.js` branches on `InputComponent.displayName`, and only the named export carries it — `React.memo(...)` does not.
- Reproduce SUIR's aria shape: `role="listbox"` (or `combobox` under `search`), `aria-expanded`, `aria-disabled`, `tabIndex=-1` when disabled. SUIR renders no hidden native input, so the form binding is entirely react-final-form.
- Decide tier 2 explicitly: reimplement or deprecate. They are published propTypes/JSDoc, so they cannot be dropped silently — but they are not evidence for an L estimate either.
- Owed to this page before the swap: a measured `classContract` and `behaviourContract`, the way step 2 part 1 produced them for `TooltipPop`. Both fields are optional in the curation only because they have not been measured for `Dropdown` yet — an absent one means unmeasured, not "no contract", and `.ui.selection.dropdown` is known to be load-bearing.

## What this page does and does not guarantee

Guaranteed, because it is derived from source and checked in CI: the import inventory; each
component's consumed set and its line count; which boundary lists each one applies; the
attributes and spreads written on the semantic-ui-react element; the native element behind
every in-house subcomponent, and that no in-house file reaches semantic-ui-react by import,
`require`, `jest.mock` or dynamic `import`; every attribute the codebase puts on the `Table`
family; that no call site passes a prop the page says was dropped; and that every one of
those has a curated description.

Also guaranteed: the tracked-corpus attribute inventory, enforced total by the contract
test against the real `EXAMPLES` manifest.

Not guaranteed, and deliberately so:

- **the forwarded set is open.** A rest spread cannot be closed by static analysis; a meta
  may pass any semantic-ui-react prop. The tier-1 list is what was found, not a proof of
  what is possible.
- **the emitted className strings.** The generator reads which props a component consumes,
  not what it composes them into. `ui table` surviving on the root is asserted by
  `src/core/components/__tests__/Table.test.js` and by the 38-example DOM baseline, not here.
- **the dropped list is not proof of absence.** It names the props that had a curated entry
  while the component was a wrapper, plus the wider semantic-ui-react surface recorded in
  prose. A caller could always pass an undocumented semantic prop; those now land on the
  element or draw a React warning, and no static check can enumerate them.
- **corpus evidence is initial-render only.** The step-0 instrumented render recorded the
  props reaching semantic-ui-react on first paint, so props that only appear once a
  control is interacted with — opening a dropdown, switching a tab — were never observed.
  Separately, a node inside an unrendered branch contributes nothing at all, which is why
  the corpus produced no tooltip evidence: both declarations sit in a `Tabs` panel that is
  not the active one. The tooltip rows above are read off the wrapper source and a direct
  probe instead.
- **consumer metas are not re-scanned.** They are untracked by design.
- **the prose.** Curated sentences are reviewed documentation, not machine-checked facts.
