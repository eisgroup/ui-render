<!--
  GENERATED FILE — DO NOT EDIT. Run `npm run docs:props` to regenerate.
  Inventories are derived from the wrapper source, `domProps.js` and the call sites;
  the prose comes from scripts/wrapper-prop-curation.js. Generator: scripts/generate-wrapper-prop-reference.js.
-->

# Supported props — `Table`, `Tooltip`, `Select` / `Dropdown`

Companion to `docs/SUPPORTED-VIEWS.md`, which lists every `view` name a meta may use. This page
covers the props of the three views whose implementation still comes from
`semantic-ui-react`, and it exists because those three are being replaced with in-house
components (UPGRADE-PLAN §9.7-F1). It is both the **supported-prop list** for meta authors
and the **parity checklist** the replacements are judged against.

**This page is generated.** Editing it by hand is pointless — the contract test regenerates
it and fails on any difference. Run `npm run docs:props` after changing a wrapper, and edit
prose in `scripts/wrapper-prop-curation.js`.

## The three outcomes, and why they are not one list

"A prop appears in a meta" is not "a prop reaches semantic-ui-react". Each prop on one of
these views has exactly one of three fates, and they are three different promises:

| Outcome | What it means | What the §9.7-F1 swap does to it |
| --- | --- | --- |
| **consumed** | the wrapper, or its caller in the engine, reads it | nothing — we already own the behaviour |
| **stripped** | removed at the DOM boundary by `src/core/components/domProps.js` | only the boundary moves |
| **forwarded** | handed to semantic-ui-react, which decides what happens | everything: this is the parity risk |

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
scanning `src` for every import, `require` and `jest.mock` of the package:

| File | How | Specifier |
| --- | --- | --- |
| `src/core/components/__tests__/Dropdown.behavior.test.js` *(test)* | `import` | `semantic-ui-react` |
| `src/core/components/__tests__/Dropdown.behavior.test.js` *(test)* | `jest.mock` | `semantic-ui-react` |
| `src/core/components/__tests__/TooltipPop.test.js` *(test)* | `import` | `semantic-ui-react` |
| `src/core/components/__tests__/TooltipPop.test.js` *(test)* | `jest.mock` | `semantic-ui-react` |
| `src/core/components/Dropdown.js` | `import` | `semantic-ui-react` |
| `src/core/components/Table.js` | `import` | `semantic-ui-react` |
| `src/core/components/TooltipPop.js` | `import` | `semantic-ui-react` |

An `eslint` `no-restricted-imports` override (in `package.json`, `eslintConfig.overrides`)
fails `npm run lint:js` on a static `import` of the package from anywhere outside `src/core/components`,
including deep imports such as `semantic-ui-react/dist/...`. A static import is *all* it sees:
it cannot see `require()`, `jest.mock()`, or a dynamic `import('semantic-ui-react')` — ESLint 8
does not visit `ImportExpression`. Nor does `lint:js` visit `.ts`/`.tsx` today, since it runs with
`--ext .js,.jsx`; the override glob already covers them for when it does.

The scan above closes every one of those gaps — dynamic imports, double-quoted specifiers and
TypeScript files included — which is why both halves run; 2 of the sites above are invisible to the rule. Neither is sufficient alone.

## Wrappers

### `Table` — wraps semantic-ui-react `Table`

`src/core/components/Table.js`, 24 lines.

Markup sugar over a native `<table>`. Semantic's own table CSS is not loaded (`collections/table` is commented out in `src/style/override/_semantic.less`), so every table style in the product is already in-house LESS.

**Consumed by the wrapper (1).** These never reach semantic-ui-react at all — we own the behaviour, and the §9.7-F1 swap cannot change it.

| Prop | Meaning |
| --- | --- |
| `fixedHeader` <br>*(has a default)* | Wraps the table in two scroll containers so the header stays visible. Wrapper-only, and unused: no meta in either corpus sets it and no call site passes it. |

**Stripped at the DOM boundary.** `src/core/components/Table.js` applies no boundary filter. Whatever the caller passes reaches semantic-ui-react, which spreads what it does not recognise onto a DOM element — so this is an unprotected boundary, and the replacement should apply `omitProps` where the current wrapper does not.

**Forwarded to semantic-ui-react (7) — the parity checklist.** The wrapper writes no attributes of its own: it spreads `props` and nothing else, so everything below arrives straight from the caller.

CSS contract: SUIR's `Table` always emits `ui` and `table` in its className, and `src/style/components/table.less:125` hangs every table cell's padding off `.ui.table`. A native `<table>` that stops emitting `ui table` loses all cell padding — so §9.7-F1.1 is right that visual parity is near-guaranteed, but only because the replacement keeps emitting those two tokens. `src/style/components/expand.less` keys off `.striped` and `.inverted` the same way. The `.ui.dropdown` half of this contract is already pinned by `src/style/__tests__/css.compilation.test.js`.

| Prop | Reaches SUIR via | Tier | Seen in | What has to be reproduced |
| --- | --- | --- | --- | --- |
| `children` | caller, via `props` | 1 | demo | The row/section tree. Every table in both corpora. |
| `className` | caller, via `props` | 1 | demo | Composed by SUIR as `ui <modifiers> table <className>`. `TableView` builds it from the meta `styles`/`fill`/`vertical` attributes. |
| `as` | caller, via `props` | 2 | — | Element override. No occurrences; a replacement may legitimately drop it. |
| `celled` | caller, via `props` | 2 | — | Not used anywhere in either corpus, and Semantic's table CSS is not loaded, so it would be inert markup even if passed. |
| `inverted` | caller, via `props` | 2 | — | Dark table. Reached only from `ErrorTable.js`, whose own importer `ErrorContent.js` has no importers — both are §9.9-H1 orphans. Decide `inverted`/`striped` together with that deletion. |
| `striped` | caller, via `props` | 2 | — | Zebra rows. Same orphan path as `inverted`, but `src/style/components/expand.less` does key off a `.striped` ancestor, so the token is not inert if the component survives. |
| `textAlign` | caller, via `props` | 2 | — | Same as `celled`: no occurrences, no loaded CSS. |

**Subcomponents.** `Table.js` re-exports `Header`, `HeaderCell`, `Row`, `Cell`, `Body`, `Footer` unchanged, so they have no wrapper layer at all: every prop is a passthrough, and the replacement owes the same subcomponent API. What the codebase puts on them, derived from the call sites:

| Component | Attributes at the call sites | Spreads | Rendered by |
| --- | --- | --- | --- |
| `Table` | `className`, `inverted`, `striped` | `...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)`, `...props` | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.Header` | `className` | — | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.HeaderCell` | `className`, `colSpan`, `key`, `style` | — | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.Row` | `className`, `key` | — | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.Cell` | `className`, `colSpan`, `key`, `scope`, `style`, `verticalAlign` | `...rest` | `core/components/ErrorTable.js`, `core/pages/main/components/LocalDraftTableRow.js`, `core/pages/main/components/TableView.js`, `core/pages/main/mapper.js` |
| `Table.Body` | — | — | `core/components/ErrorTable.js`, `core/pages/main/components/TableView.js` |
| `Table.Footer` | — | — | *nothing* |

Every prop in the table above then rides those spreads or those attributes. The two unfiltered spreads are the ones to fix while replacing: `mapper.js` spreads a meta node's whole rest bag onto `Table.Cell`, and the tooltip wrapper spreads its own rest bag onto the popup.

### `TooltipPop` — wraps semantic-ui-react `Popup`

`src/core/components/TooltipPop.js`, 24 lines.

Hover tooltip over SUIR `Popup`. Reached two ways: a `view: "Tooltip"` node (`mapper.js`, which maps `label` to `content`), and the `tooltip` attribute on ANY node (`Render.js`, which wraps the rendered node and spreads `tooltip` when it is an object — so an object `tooltip` is an unfiltered passthrough into SUIR).

**Consumed by the wrapper (4).** These never reach semantic-ui-react — we own the behaviour, and the §9.7-F1 swap cannot change it.

| Prop | Meaning |
| --- | --- |
| `title` | The tooltip body. Forwarded as SUIR `content`. A function value is wrapped as `{children: fn}` — the workaround for Semantic-Org/Semantic-UI-React#4029. |
| `children` | The trigger element. Forwarded as SUIR `trigger`. |
| `delay` <br>*(has a default)* | Milliseconds before the tooltip opens; default 500, deliberately slower than Semantic's own 50 ms. Forwarded as `mouseEnterDelay`. |
| `inverted` | Dark colour scheme. Intercepted and re-passed under the same name, so it also reaches the emitted className. Always true from both entry points. |

`inverted` is also written back onto the semantic-ui-react element under the same name, so the same prop appears in both tables.

**Stripped at the DOM boundary.** `src/core/components/TooltipPop.js` applies no boundary filter. Whatever the caller passes reaches semantic-ui-react, which spreads what it does not recognise onto a DOM element — so this is an unprotected boundary, and the replacement should apply `omitProps` where the current wrapper does not.

**Forwarded to semantic-ui-react (8) — the parity checklist.** The wrapper writes `inverted`, `trigger`, `content`, `mouseEnterDelay` as explicit attributes, and spreads `props` AFTER them — so a caller CAN override what the wrapper wrote.

CSS contract: The loaded `modules/popup` LESS styles `.ui.<placement>.popup.transition.visible` and its inner `.content`; SUIR renders that markup through a `Portal`. The replacement has to emit the same structure until step 4 re-homes the CSS.

| Prop | Reaches SUIR via | Tier | Seen in | What has to be reproduced |
| --- | --- | --- | --- | --- |
| `content` | element | 1 | demo | The tooltip body, from `title`. `mapper.js` maps a `view: "Tooltip"` node's `label` to `content` directly, so on that path `content` arrives through the rest spread and wins over `title`. |
| `inverted` | element | 1 | demo | Always set from both entry points. Adds `inverted` to the popup className. |
| `mouseEnterDelay` | element | 1 | demo | From `delay`. SUIR does not declare it on `Popup`, only on `Portal`, and the wrapper's spread lands after the portal defaults — so the 500 ms does take effect. |
| `trigger` | element | 1 | demo | The element the tooltip hangs off. Comes from `children`; a caller may override it through the rest spread, which is spread last. |
| `basic` | caller, via `props` | 2 | — | Borderless style. No occurrences. |
| `hoverable` | caller, via `props` | 2 | — | Keeps the popup open while the pointer is over it. No occurrences. |
| `on` | caller, via `props` | 2 | — | Trigger events, SUIR default `['click', 'hover']` — so today's tooltip also opens on CLICK and does NOT open on focus. Reproducing that exactly, or fixing it, is a step-2 decision. |
| `position` | caller, via `props` | 2 | — | Placement, SUIR default `top left`. No meta in either corpus passes it; the only code that configures it (`components/utils/components.js`) has no non-test importer. |

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

### Step 1 — `Table`

**Effort: S (unchanged, arguably smaller).**

- Keep emitting `ui` and `table` on the root element, or every table cell loses its padding.
- Apply `omitProps` inside the new `Table.Cell`: `mapper.js` spreads a node's whole rest bag onto it, and that spread is unfiltered today.
- Decide `verticalAlign` deliberately — SUIR emits `top aligned` and no loaded CSS selects on `aligned`.
- Decide `inverted`/`striped` together with the §9.9-H1 deletion of `ErrorTable`/`ErrorContent`; they are the only source of both.
- `jest.config.js` sets a per-file threshold for `TableView.js` and none for `Table.js` — a real in-house `Table.js` wants its own entry.
- `TableView.js:364` discards `sellStyles` — a typo: no such prop exists, and the list it sits in exists precisely to keep props off the DOM. Inert today (nothing passes `cellStyles` either), but it is a dead entry in a boundary, so resolve it while rewriting rather than carrying it over.

### Step 2 — `TooltipPop`

**Effort: S–M (unchanged, but the risk moved).**

- The tracked corpus renders ZERO tooltips: the only `view: "Tooltip"` node and the only `tooltip` attribute both sit in a non-active `Tabs` panel of one example, and the consumer metas contain none at all. Verifiable in the baseline itself — neither trigger label, and no popup markup, appears anywhere in the 38 snapshots. So the 38-snapshot DOM baseline cannot catch a tooltip regression at all; the whole gate is the 5 tooltip cases in `UIRender.overlay-behavior.test.js` plus the SUIR-mocked wrapper unit test.
- This is an unfiltered DOM boundary: the wrapper spreads its rest bag onto SUIR, which spreads what it does not recognise onto the popup `<div>`. Apply `omitProps` in the replacement.
- Decide whether to keep SUIR's `on: ['click', 'hover']` default — the tooltip opens on click and does not open on focus — or to fix it to hover+focus.
- Losing SUIR also loses `@popperjs/core`/`react-popper`, so §9.7-F1.2's zero-dependency option (b) would be a regression against today: no flip, no overflow handling.

### Step 3 — `Dropdown`

**Effort: L (unchanged size, different location).**

- The L is NOT in `search`/`multiple`/`allowAdditions`/`clearable` — nothing uses them. It is in the keyboard/a11y matrix, the cascading flows, `upward`'s auto-flip, and the `.ui.selection.dropdown` CSS contract.
- Keep `displayName = 'Dropdown'` AND the named-vs-default export split: `modules/form/utils.js` branches on `InputComponent.displayName`, and only the named export carries it — `React.memo(...)` does not.
- Reproduce SUIR's aria shape: `role="listbox"` (or `combobox` under `search`), `aria-expanded`, `aria-disabled`, `tabIndex=-1` when disabled. SUIR renders no hidden native input, so the form binding is entirely react-final-form.
- Decide tier 2 explicitly: reimplement or deprecate. They are published propTypes/JSDoc, so they cannot be dropped silently — but they are not evidence for an L estimate either.

## What this page does and does not guarantee

Guaranteed, because it is derived from source and checked in CI: the import inventory; each
wrapper's consumed set and its line count; which boundary lists each wrapper applies; the
attributes and spreads written on the semantic-ui-react element and on every `Table`
subcomponent call site; and that every one of those has a curated description.

Also guaranteed: the tracked-corpus attribute inventory, enforced total by the contract
test against the real `EXAMPLES` manifest.

Not guaranteed, and deliberately so:

- **the forwarded set is open.** A rest spread cannot be closed by static analysis; a meta
  may pass any semantic-ui-react prop. The tier-1 list is what was found, not a proof of
  what is possible.
- **corpus evidence is initial-render only.** The step-0 instrumented render recorded the
  props reaching semantic-ui-react on first paint, so props that only appear once a
  control is interacted with — opening a dropdown, switching a tab — were never observed.
  Separately, a node inside an unrendered branch contributes nothing at all, which is why
  the corpus produced no tooltip evidence: both declarations sit in a `Tabs` panel that is
  not the active one. The tooltip rows above are read off the wrapper source and a direct
  probe instead.
- **consumer metas are not re-scanned.** They are untracked by design.
- **the prose.** Curated sentences are reviewed documentation, not machine-checked facts.
