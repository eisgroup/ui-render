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

**2 of the 3 done so far.**
`Table`, `TooltipPop` are in-house and
import nothing; `Dropdown`
still wraps semantic-ui-react. The two kinds of section answer different
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

### `TooltipPop` — in-house, no semantic-ui-react

`src/core/components/TooltipPop.js`, 371 lines. Replaced the wrapper in §9.7-F1 step 2 part 3.

The hover tooltip, over the same inline `<span>` `components/Tooltip.js` has shipped for years. Reached two live ways: a `view: "Tooltip"` node (`mapper.js`, which maps `label` to `title`) and the `tooltip` attribute on ANY node (`Render.js`, which wraps the rendered node and spreads an object `tooltip` — still an unfiltered passthrough, but into 13 accepted names now instead of 45). This was a FIX, not a trade: measured in real Chrome on the production build, the SUIR bubble rendered at the document origin at every use site a meta can declare (~730 px from its trigger on `buttonIcon`, 2538-3006 px on `all`) and every open raised an uncaught `TypeError` from popper's flip modifier, because SUIR clones the trigger with a `ref` and nothing a meta can declare can hold one. There was no working positioning to lose.

**What it emits.** Host: `tooltip-host <classWrap>`, always, open or closed. Bubble, only while open: `tooltip no-wrap <resolved placement words> show [inverted] <className>` — the same class string `Tooltip.js` emits, so the two converge on one CSS contract. The placement words are the REQUESTED position, not a resolved one: nothing measures, so there is no flip to rewrite them. Closed, the component renders the trigger byte-for-byte as it renders without a tooltip and adds nothing to `document.body` — which is why the 38-example DOM baseline is blind to tooltips by construction, exactly as it was before.

| Component | Element | Notes |
| --- | --- | --- |

CSS contract: The bubble is now mounted INSIDE `.ui-render`, which is what makes our own CSS apply to it at all — the SUIR bubble portaled into `document.body`, outside the prefixwrap scope, so not one of the 13 `.ui.popup` rules could paint it and the live tooltip was unstyled text. It shares `src/style/components/tooltip.less` with `Tooltip.js`, so `tooltip`, `no-wrap`, the four placement words and `show` are all load-bearing, and `.show` must keep beating the `*:hover > &` reveal at equal specificity. THE HAZARD THIS STEP CARRIES: `tooltip.less` sets `pointer-events: none` on the bubble; without it the bubble would sit under the pointer, `mouseleave` would fire on the host, and the tooltip would flicker. `css.tooltip-contract.test.js` joins the emitted markup to the loaded CSS in both directions.

**Consumed by the root (13).** Read by `TooltipPop` itself; everything else rides the rest spread onto the element.

| Prop | Meaning |
| --- | --- |
| `title` | The tooltip body, rendered as the bubble's children. A function value is called and its result rendered — the SUIR-#4029 workaround is gone, but the calling convention it produced is kept, because two metas in the corpus rely on it. Overridden by `content` when both are given. |
| `children` | The trigger. Rendered inside the host `<span>` untouched — not cloned, so a trigger's own handlers are never wrapped or replaced, and no `ref` is required of it. That last part is the whole bug fix. |
| `delay` <br>*(has a default)* | Milliseconds before a HOVER opens the tooltip; default 500, deliberately slower than Semantic's 50 ms, and a UX decision pinned to the millisecond in three suites. Focus ignores it. |
| `inverted` | Dark colour scheme, emitted as the `inverted` class. Always true from both engine entry points. |
| `content` | Alias for `title`, and it wins. Was only reachable through the rest spread before, which is how a caller-supplied `content` used to override `title` by accident of ordering; now that precedence is explicit. |
| `position` <br>*(has a default)* | Placement words (`"top left"`, `"bottom"`, …), default `"top"`. Emitted as classes for our CSS to position with; there is no measuring, so an unknown word is simply not emitted. |
| `open` | Controlled open state. When given, the component renders it and stops managing its own — hover, focus, Escape and click-outside still call `onOpen`/`onClose` so a controlled host can respond, but they do not move the bubble themselves. |
| `disabled` | Suppresses opening entirely; the trigger still renders. |
| `className` | Appended last on the BUBBLE. |
| `classWrap` | Appended on the HOST span. Kept under the old name because both engine entry points pass it. |
| `id` | Overrides the generated bubble id. Given one, `aria-describedby` points at it; otherwise a per-instance `ui-render-tooltip-N` is generated. |
| `onOpen` | Called when the bubble opens, controlled or not. |
| `onClose` | Called when it closes, controlled or not. |

**Consumed by every subcomponent (0).** All six share one implementation, so this list applies to each of them identically.

| Prop | Meaning |
| --- | --- |

**Stripped at the DOM boundary.** `src/core/components/TooltipPop.js` applies `ENGINE_PROPS`, `FIELD_ONLY_PROPS` from `src/core/components/domProps.js` in all 1 components, so these never become attributes: `view`, `index`, `data`, `_data`, `symbol`, `_comment`, `expanded`, `translate`, `onDataChanged`, `currencyCode`, `name`, `label`.

**Passthrough.** `style`, `data-*`, `aria-*` and every event handler still reach the bubble untouched through `omitProps(…, ENGINE_PROPS, FIELD_ONLY_PROPS)` — the same DOM boundary every other component uses, which is new here: SUIR's `Popup` applied no such filter, so `§9.7-F1` step 2 also closed the engine-prop leak on this path. There is no `forwardRef`: nothing in `src` passes a ref to a tooltip, and the host `<span>` holds the only ref the component itself needs.

**Dropped (18) — the semver record.** Props semantic-ui-react handled that this implementation deliberately does not. All of them remain REACHABLE from a consumer meta — `mapper.js` spreads a `TableCells` node's whole rest bag onto the cell and `TableView` spreads its own rest onto the table — so the component strips them explicitly and warns once per prop in development. Stripping matters because a string-valued one would otherwise land as a lowercase DOM attribute (`verticalAlign="top"` rendered `verticalalign="top"`), which is the junk the DOM contract's tripwires exist to keep out; warning matters because a meta still carrying one would otherwise never learn it stopped working. React's own unknown-prop warning is not relied on: it is silent for a lowercase name.

| Prop | Why it is gone |
| --- | --- |
| `on` | CLICK-TO-OPEN. SUIR ran `on: ['click', 'hover']`; every tooltipped node in the corpus already owns its `onClick`, so one gesture fired both the action and the tooltip and the tooltip arrived after the action had run. Dropped deliberately and recorded — on this page, in the step PR and in UPGRADE-PLAN §9.7-F1 step 2, which is where the project keeps removal decisions until step 5 writes the CHANGELOG it owes. This row IS the record; it is not a pointer to one elsewhere. Focus-to-open, `role="tooltip"` and `aria-describedby` were added BECAUSE of this removal: with click gone and hover unavailable to a keyboard there would otherwise be no keyboard path to the content at all. |
| `hoverable` | Was what let the pointer travel onto the bubble. Now unconditional, so the prop has nothing left to turn on. |
| `closeOnDocumentClick` | Closing on an outside click is unconditional. Nothing passed this, and a tooltip that survives a click elsewhere is a popover, which this is not. |
| `closeOnEscape` | Same: Escape always dismisses. |
| `mouseLeaveDelay` | The 70 ms close delay is fixed. It exists so the pointer can cross the gap between trigger and bubble, which is a layout constant, not a caller's choice. |
| `mountNode` | Portal target. There is no portal — the bubble is a sibling of the trigger, which is what brings it inside the prefixwrap scope. |
| `popper` | Popper.js configuration. No popper. |
| `offset` | Popper offset, in px. Positioning is CSS now; use `className`. |
| `pinned` | Popper flip/shift suppression. Nothing flips. |
| `hideOnScroll` | Closed the bubble on window scroll, to hide a bubble that no longer tracked its trigger. A bubble positioned by CSS moves WITH its trigger, so the problem it worked around is gone. |
| `defaultOpen` | Uncontrolled initial state. Use `open` with `onClose`. |
| `trigger` | SUIR took the trigger as a prop; this component takes `children`. |
| `header` | Bolded first line inside the bubble. Zero occurrences in either corpus; put it in `title` as an element. |
| `as` | Element override for the bubble. The element is fixed at `<span>`, which the CSS assumes. |
| `basic` | Semantic style modifier (no arrow). Emitted a class no loaded rule selects. |
| `flowing` | Removed Semantic's width cap. Ours does not cap width — `no-wrap` is the contract instead — so there is nothing to remove. |
| `size` | Semantic size modifier. Inert class; the bubble takes its type scale from `tooltip.less`. |
| `wide` | Semantic `wide`/`very wide` width steps. Same — no loaded rule selects them. |

Those 18 are the names the component actively warns about in development, one `console.warn` per name. They are the ones that were REACHABLE: because SUIR's rest spread landed last, a caller reached `Popup.handledProps` ∪ `Portal.handledProps` = 45 names, 16 of them Portal-only and absent from `Popup`'s propTypes entirely (`closeOnPortalMouseLeave`, `closeOnTrigger*`, `openOnTrigger*`, `eventPool`, `triggerRef`, …). The remaining ~14 are Semantic's own internals (`context`, `onMount`/`onUnmount`, `openOnTriggerFocus`, the transition props) and warning on them would be noise: nothing in the product, in any audited meta or in either corpus passes one. The narrowing is from 45 accepted names to 13. Step 5 records the semver call for the whole set; on this evidence it is a minor with a changelog entry for `on`.

**Call sites.** What the codebase puts on the family, derived from the source. This was the step-1 parity surface and it is kept afterwards, because it is what any future change to the family is measured against:

| Component | Attributes at the call sites | Spreads | Rendered by |
| --- | --- | --- | --- |
| `TooltipPop` | `inverted`, `title` | `...props` | `core/pages/main/mapper.js`, `demo/pages/TooltipHarness.jsx` |

`mapper.js`'s spread onto `Table.Cell` is a meta node's whole rest bag and is still unfiltered at the call site — the filter is now inside the cell, which is why it is safe. The remaining unfiltered boundary on this surface is the tooltip wrapper, and step 2 owns it.

## Wrappers — what is left

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

### Step 2 — `TooltipPop` — SHIPPED

**Effort: S–M as estimated, and the estimate held for the component. The specs cost more than the component did: 23 of the 38 browser tests were reference facts about the wrapper and had to be re-measured and rewritten, which is the price of having pinned the old behaviour honestly rather than loosely..**

- OBLIGATION 1 of 3 — DISCHARGED, in JavaScript. The 500 ms survives to the millisecond. What made it possible is that the bubble is MOUNTED ONLY WHILE OPEN: a bubble that is in the DOM is revealed instantly by `*:hover > .tooltip` and no class can defeat that at equal specificity, so mount-on-open is what buys the delay, focus-open, Escape and click-outside all at once. Measured in Chrome, not merely in jsdom: nothing is in the DOM at 0/100/300/450 ms and the bubble is there after 500. `transition-delay` was rejected — it would have meant editing a rule shared with `Slider`, `Upload` and the validation tooltip.
- OBLIGATION 2 of 3 — DISCHARGED AS A REMOVAL, on the maintainers' instruction, and recorded: the `dropped.on` row on this page is the record, since the CHANGELOG itself is step 5's debt. The reason is the collision: every tooltipped node in the corpus already owns its `onClick`, so one gesture fired both the action and the tooltip and the tooltip arrived after the action had run. TWO MORE ROUTES HAD TO BE CLOSED BEFORE THE REMOVAL MEANT ANYTHING, and both were found by the browser leg, not by reasoning: (a) clicking a `<button>` FOCUSES it, and focus-open then showed the bubble instantly — suppressed by reading `onPointerDown`; (b) a touch TAP synthesises the compatibility mouse sequence, nothing follows to move the pointer away, so the emulated hover stuck and the bubble appeared 500 ms after every tap — suppressed by reading `event.pointerType`. Neither would have been FOUND in jsdom — nothing there focuses on click, and a tap has no compatibility mouse sequence — though both are pinned there now: `pointerType` needs a hand-built event to survive, because jsdom implements no `PointerEvent` and RTL's `fireEvent.pointerOver(el, {pointerType})` therefore delivers `null` (measured). The consequence, stated plainly rather than sold: a touch-only device now has no way to see a tooltip at all.
- OBLIGATION 3 of 3 — DISCHARGED. Escape and click-outside both dismiss, from listeners attached to `document` ONLY while open, and the Escape-from-an-unrelated-native-input case is asserted in the browser leg where it is the only place it can be asserted. Focus-to-open, `role="tooltip"`, the bubble `id` and `aria-describedby` came in as a CONSEQUENCE of obligation 2 rather than as separate features: with click gone and hover unavailable to a keyboard there would otherwise be no keyboard path to the content at all.
- HAZARD — HANDLED, and it turned out to bind one behaviour we would otherwise have claimed. `pointer-events: none` is set and pinned in `css.tooltip-contract.test.js`; without it the bubble sits under the pointer, `mouseleave` fires on the host and the tooltip flickers. The consequence is that the bubble CANNOT be hoverable: the pointer over a `pointer-events: none` bubble is really over whatever is behind it. Hoverable text and a non-interactive bubble are mutually exclusive, and the bubble stays non-interactive — the same behaviour the wrapper had without `hoverable`. It also invalidated an INSTRUMENT: `document.elementFromPoint` skips such elements, so every "is the bubble painted here" assertion silently inverted. `e2e/fixtures.js` grew `paintedTopmostAt` for that, which re-enables pointer events for the probe alone.
- A SECOND POSITIONING DEFECT, FOUND AND FIXED ONLY BECAUSE THE BROWSER LEG EXISTS: with the component correct, the bubble still landed 559 px from its trigger. `.tooltip-host` was `inline-flex`, but a flex item is BLOCKIFIED (`inline-flex` -> `flex`, a used value with no rule to blame) and then stretched by the container's `align-items: stretch`, so inside `div.flex--col` the host came out 1222 px wide around a 35 px button and the bubble followed the host. Fixed with `width: fit-content`, which is a definite cross size so `stretch` stops applying; `width` only, because `height: fit-content` would also stop the host stretching vertically in a ROW container, which is how a wrapped button gets its height today. This is the clearest case in the step for why a CSS-positioned tooltip needs a browser gate: every jsdom suite was green while the shipped tooltip was unusable.
- FINDING 4 OF THE REFERENCE — CLOSED, and half of it was never broken. `tooltip.less`'s four corner placements did put the bubble on its own trigger (`.tooltip.left`/`.right` set `top: 50%` at the same specificity as `.top`/`.bottom`, so a corner class string matched both and the axis came out over-constrained); they are fixed by writing the losing offset back per corner rather than by raising specificity. But `top right` and `bottom right` were ALSO reported broken by an assertion that required every corner to align to its host's LEFT edge, which a right corner cannot do — they were placing correctly the whole time. 8 of 8 now. The component still asks for `top` rather than the wrapper's `top left`: `top left` was semantic-ui-react's own default, not something a meta requested, so the bubble is centred above its trigger instead of left-aligned above it.
- SHIPPED — the gate. 63 tooltip tests across four files where there were 10, only 5 of which could fail if the tooltip broke (the other 5 asserted the props handed to a mock): `components/__tests__/TooltipPop.test.js` (rewritten against the REAL `semantic-ui-react`, no `jest.mock`), `components/__tests__/TooltipPop.behavior.test.js` (new — the interaction contract), `pages/main/__tests__/UIRender.overlay-behavior.test.js` (extended to all three meta entry points) and `style/__tests__/css.tooltip-contract.test.js` (new — joins the emitted class string to the compiled CSS rules), plus the browser leg — 39 Playwright tests, of which 23 were reference facts about the wrapper that part 3 had to re-measure and rewrite. THE POSITIONING-PRIMITIVE DECISION, which part 1 left to the maintainers, resolved as: CSS placement off the host box, no measuring, no popper. Its costs are named where they are measured — no flip, no viewport shift, no 250 px wrap, the bubble clipped by an `overflow: hidden` ancestor, and a trigger taken OUT of normal flow leaves the host collapsed so the bubble follows the host (its own harness section). The first three were reachable only on the harness page: from a meta, popper threw before writing a coordinate, so nothing in the product ever flipped.
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
