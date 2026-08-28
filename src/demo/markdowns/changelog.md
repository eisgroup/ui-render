### Table of Contents

### Unreleased

#### Meta contract

- The `meta.json` contract now ships as a JSON Schema (draft 2020-12) at
  `eis-ui-render/meta.schema.json`, so meta authors get editor autocomplete and validation.
  Point a file at it with `"$schema": "./node_modules/eis-ui-render/meta.schema.json"`, or map it
  once for `**/*_meta.json` in the workspace settings. The schema stays as permissive as the
  renderer — component attributes it does not list are still accepted, and an unlisted `view`,
  render-method, action or normalizer name is suggested-but-not-required — and constrains only the
  shapes the renderer genuinely needs: `items`, `headers`, `extraHeaders` and `extraItems` must be
  arrays and `name` must be a string. The suggested vocabularies are checked against the
  renderer's own definitions, so they cannot drift from it.
- New opt-in `validateMeta` prop runs the same rules at runtime and reports the **JSON path** of
  the offending node — `items[3].items[0].name` — instead of leaving a stack trace inside a
  minified bundle. `error` findings are shapes the renderer fails on; `warning` findings are nodes
  that render but degrade silently, such as an unknown `view` (a "field does not exist"
  placeholder) or an unknown `render*` method (plain text). It is off by default and walks nothing
  until enabled, reports to `console.warn`, accepts a function instead of `true` to collect the
  findings, and never throws into the host application.
- New optional root-level `metaVersion` field (`"MAJOR"` or `"MAJOR.MINOR"`; current contract
  version `1`) records which contract a file was authored against, so future contract changes can
  be additive and announced. **Absence means "current"**, so no existing `meta.json` needs to
  change. The renderer ignores the value and strips the field before rendering, exactly as it now
  strips `$schema`, so declaring either changes no output; only dev-mode validation reads it.
  This is unrelated to the legacy `version` attribute, which the renderer still discards.

#### Renderer configuration and error reporting

- **The `dateFormat`, `currency` and `language` props now work.** They were accepted and then
  silently dropped: the renderer discarded `dateFormat` on its way down the tree, nothing fed
  the configuration context, and every component fell back to the built-in `MM-DD-YYYY`
  regardless of what the host passed. All three are now published to every rendered component
  — a nested table cell or popup field formats a date exactly like a top-level field — and each
  key is merged independently, so passing one does not reset the others. `currency` and
  `language` also reach the shell's CSS classes (`.app.EUR`, `.app.lang--fr`). **This changes
  rendered output** for any host that passes `dateFormat`: dates start honouring it. It is
  unrelated to `meta.currencyCode`, which still selects the currency symbol used by the value
  renderers.
- `TextDateValue` honours the `dateFormat` prop it declares, instead of always reading the
  configured format. An explicitly given format wins over the configured one.
- **New `onError` prop**: a report for every node whose subtree fails to render — `{error,
  errorInfo, path, props, message}`, where `path` is the JSON path of the failing node in
  `meta` (`items[3].items[0]`), the same notation dev-mode meta validation uses. Reporting a
  render failure was previously impossible for a host to observe at all: the library's own sink
  read the wrong field names off the report and printed `undefined undefined` to
  `console.log`, so a mis-configured node failed silently. The sink is fixed, reports on the
  error channel, and now names the failing node; the diagnostic rendered in place of the
  failed subtree names it too, instead of showing a bare `Error: …`. A host reporter that
  throws cannot replace the failure it was called to report.

#### Accessibility

- The text, number and date inputs no longer emit an `aria-describedby` pointing at an element
  that does not exist. The attribute was unconditional while the element carrying the target id
  renders only when there is an error or info message, so every reference in a form without
  validation messages was dangling — an axe `aria-valid-attr-value` violation, and nothing for
  a screen reader to announce. The reference now appears exactly when the message it points at
  does. In the demo example set this removes 57 dangling references; no other rendered output
  changes.

#### Compatibility

- Development and the primary test suite now run on React 18.3.1, and the demo mounts through the
  React 18 root API, so it renders with automatic batching exactly as a host on 18 does.
- The peer range stays additive: host applications may use React 16.14, 17 or 18. Hosts on 16 or 17
  need change nothing.
- `TooltipPop` and `Image` no longer use `defaultProps`, which React 18.3 warns about for function
  components and React 19 removes. Their defaults are unchanged.
- The Moment peer range now accepts all compatible 2.x releases from 2.29.4 onward.
- Public TypeScript declarations now describe the shipped callable component: `data` and `meta`
  are required, runtime-supported props are optional, and the package supports an interop default
  import or a direct TypeScript `import = require` without promising nonexistent instance or named
  value APIs.
- The public `translate` callback retains its string-to-string contract; optional and non-string
  renderer values now bypass it unchanged.

#### Packaging

- Stylesheets, fonts and images are no longer duplicated in the published package. The real files
  ship once in the root `static/` folder — the payload to copy into a host's web root, since image
  paths resolve to `<homepage>/static/images/` — and `dist/static/all.css` and `font.css` became
  one-line `@import` re-exports of it. Both import paths keep working; `semantic.css` remains an
  empty stub in both places.
- The tarball dropped from 579 files / 11.6 MB unpacked to 295 files / 7.25 MB (2.53 MB packed).
  Source maps continue to ship for host debugging.

#### Tests and CI

- Added behavior contracts for submit, validation, dynamic `showIf`, data updates,
  upload/download, popup actions, API error handling, and nested `dataKind` add/remove flows.
- Added focused contracts for form lifecycle synchronization, meta/action transformation,
  mapper field orchestration, grouped tables, TableView behavior, Dropdown normalization,
  date-field lifecycle, Tabs interactions, dynamic row popups, InputNumber and Slider
  interactions, upload validation, AutoSave sequencing, renderer error isolation, and the
  public provider/library wrapper. Additional contracts cover InputNative lifecycle, lazy
  Expand content, native Dropzone events, malformed PieChart data, and defensive nested
  `dataKind` synchronization. The latest contracts cover local draft preservation, recursive
  object sanitization, lodash-compatible collection/equality behavior, mapper relative context,
  immutable table extras, and asynchronous plain-text API failures. Follow-up contracts cover
  the InputDate/rc-picker boundary, controlled ProgressSteps updates, ScrollView behavior,
  debounce/throttle timing windows, and browser/backend storage routing. The current contracts
  cover Counter lifecycle and timing, hidden and sticky Input variants, ToggleField mappings,
  cyclic/repeated JsonView values, and Render setup/error defaults. The latest batch covers
  Pagination normalization/accessibility, Checkbox mappings and readonly behavior, ProgressBar
  timers and edge values, and definition/localisation integrity. Formatting follow-ups cover
  dropdown language fallbacks, currency/fraction modes, and null Select labels. The next batch
  covers timeout/interval cleanup, duration and Moment-format parity, numeric boundary behavior,
  invalid Select indices, and raw/structured form-data isolation. The migration-safety pass now
  also covers browser/backend environment bootstrapping, string edge contracts, ID collision
  history, lazy ExpandList content, page-level Tabs transitions, recursive Render failures,
  mapper defensive factories, Final Form subscription lifecycles, and popup action arguments.
- Added a smoke contract covering every registered demo example and enforceable coverage
  thresholds for the renderer's critical files.
- Added GitHub Actions checks for JavaScript/CSS lint, coverage, library build, and demo build.
- Added a public-declaration gate against locked React 16/17/18 types in interop and direct
  CommonJS modes, including a check of the built package's callable runtime export.
- Added packaging gates: budgets over the published manifest (file count, sizes, required paths,
  duplicate assets) and a packed-tarball smoke that extracts the artifact, resolves every
  stylesheet `@import` and `url()` target, and server-renders the bundle in a throwaway consumer
  holding only React, React DOM and Moment.
- JavaScript lint now runs with `--max-warnings 0`. All 22 pre-existing warnings were triaged:
  eighteen were genuine cleanups, four are suppressions carrying a comment that states why the rule
  does not apply, and three turned out to be the defects listed under Fixes.
- Removed 14 devDependencies with no references in code, configs, scripts or CI, cutting the
  installed development tree by 14 packages. This does not affect the published package.
- Build configuration: the demo build no longer duplicates the shared Babel presets. Every
  pipeline — library, demo and tests — now reads them from one `babel.config.js`, with only the
  development-time refresh transform declared by the demo. Emitted bundles are unchanged.
- The declared peer range is now tested, not just asserted. The full suite runs on React 16.14 in
  its own gating check alongside the React 18 one, the packed artifact is server-rendered against
  React 16.14 and 17, and a non-gating check runs the suite on React 19 so upstream drift shows up
  early. Assertions that had been pinned to React version internals — a function component's second
  argument, and component names appended to development warnings — now assert behaviour instead, so
  the same suite passes on React 16.14, 17, 18.3 and 19.

#### Fixes

- Rendered markup no longer carries the internal `currencyCode` value as an HTML attribute.
  The engine hands it to every node so value renderers can choose a currency symbol, but most
  views never read it, and it was reaching the page as `currencycode="..."` on `div`, `span`,
  table cells and inputs — 331 occurrences across 33 of the 38 bundled examples — which React
  also reported as an unrecognised DOM prop on every render. It is now stripped where views are
  resolved, and passed explicitly to the two that consume it. Currency formatting is unchanged.
- **Rendered markup no longer carries the renderer's internal props as HTML attributes.** The
  same defect as the `currencyCode` entry above, but on the other path — the one taken by value
  renderers a `render*` attribute selects (`Float`, `Percent`, `Double5`, `Currency`) and by any
  meta attribute no view consumes. Across the 38 bundled examples the page was emitting `data="[object Object]"`
  (40), `_data="…"` (40), `symbol="$"` (23), `view="…"` (15), `index="…"` (8), `label="…"` (6) and
  `_comment="…"` (2 — the meta author's own note, rendered into the page). All are now zero.
  None of them produced a console warning, because React does not report an unknown *lowercase*
  attribute; they were only visible in the markup.
- **`name` is now emitted only on form controls.** It is the field-binding path a form control
  must carry, but it was also reaching `<table>`, the dropdown's wrapper `<div>`, the upload drop
  zone and any layout `div`/`span` that happened to carry a data binding — 108 of the 165
  occurrences in the bundled examples. The 57 that bind a real field are unchanged, and every
  form value still round-trips into the submit payload exactly as before. **If your application
  or your tests select these elements with a `[name="…"]` CSS selector, use a class, an id or a
  role instead:** for form fields nothing changed, but for a table, a dropdown wrapper or a
  layout element the attribute is gone.
- Both of the above are enforced at one place — a named list of engine-internal props applied
  where a component hands props to a DOM element — so adding an internal prop to the engine no
  longer means auditing a dozen components, which is how this leak returned four times before.
  Every component that can be reached from a `meta.json` and hands props to an element is
  covered; components nothing in a meta resolves to are not, and become covered the day they
  are wired up. Nothing else about the rendered markup changed:
  measured attribute-for-attribute against the previous DOM baseline of all 38 examples, every
  element, every `class`, every `id` and every piece of visible text is identical — the diff is
  the removal of those attributes and nothing else.
- A `_comment` attribute anywhere in a `meta.json` is now dropped before rendering, the same way
  `$schema` and `metaVersion` already were, so annotating meta for the next author costs nothing.
  Unlike those two it is not declared in `meta.schema.json`, so an editor will not suggest it —
  it is accepted rather than advertised.
- Upload no longer hands the host a blanked-out drag event on React 16. Its drag focus/blur callbacks
  run after the component re-renders, and React 16 recycles event objects once the original handler
  returns, so an application reading `type` or `target` from the forwarded event saw `null`. The event
  is now retained explicitly before being forwarded. React 17 and later were never affected.
- A popup can no longer be bound to the wrong table. When a popup opened from a table row could not
  determine which table it belonged to, the renderer guessed by looking for two specific field names
  in the data and adopting whichever it found — so an application that happened to use one of those
  names could get a popup wired to an unrelated table, and the user's edit was written into that
  table's row. The guess is gone. A popup declared inside the row is still scoped automatically; a
  popup declared outside the table states its scope with `{relativePath: '<table name>'}` in the
  `popupOpen` arguments, and an unresolved scope is now reported in the console instead of guessed.
  See the Popup section of the configuration docs.
- Popups declared from an interpolated template no longer fail silently when the template's local
  data is the row array. The row-extraction step read a variable declared further down the same
  block, which threw before the popup could open.
- Demo API errors now surface the server's message. When an error string carried no recognizable
  message payload, the demo's response interceptor threw while parsing it and reported that
  failure instead of the original error.
- An `Image` given a `src` but no `name` no longer crashes the render. The alt text was derived from
  the file name unconditionally; it now falls back to an empty alt, which is the correct value for
  an image with nothing to describe.
- `Dropdown` no longer writes `currencyCode` and `onDataChanged` onto the rendered element. The
  renderer hands those to every view; Semantic forwards anything it does not recognise to the DOM,
  so React reported an invalid attribute and an unknown event handler on every page with a dropdown.
- A `Dropdown` option declared without a value can now actually be selected. Its value was being
  rewritten to the string `"null"`, while the cascading reset used the option's text — so the two
  never agreed and the control showed nothing selected. Such an option now carries its text as its
  value, which is what the reset already assumed.
- Restored the upload ref contract after the in-house Dropzone replacement so successful
  uploads reinitialize the rendered data.
- Corrected the nested `dataKind` demo table metadata so it renders valid table markup.
- `popupOpen` actions receive the row index as context. `relativePath` is deliberately not
  forwarded: it outranks every other source when a popup resolves its field names, so a popup
  template declared outside the table was rebound onto the table's path and discarded its edit.
- Stopped both Tabs implementations from passing `onClick={false}` to the DOM.
- Date fields now forward blur events to Final Form and correctly leave focused state.
- Dropdown now preserves controlled numeric zeroes, keeps sanitized multi-select values in
  state, normalizes color values from its live state, and retains the selected value for
  `onSelect` after rerendering.
- InputNumber now applies percentage/thousands formatting and parsing, honors uncontrolled
  defaults, preserves uncontrolled edits, tolerates an omitted `onChange`, and safely renders
  sticky placeholders and incomplete numeric input.
- Slider no longer reacts while disabled/readonly, navigates off-mark discrete values correctly,
  mutates neither frozen nor regular label options, and removes drag listeners on unmount.
- Readonly uploads are removed from keyboard tab order consistently with their disabled picker.
- Compact InputNative fields resize correctly for zero/empty controlled values and can enable
  compact mode after mounting; lazy Expand children now receive their documented component ID.
- Dropzone applies `accept` filtering to file-dialog selections, keeps disabled drag/input
  events inert, and balances nested drag enter/leave state after drops.
- PieChart sanitizes malformed/non-finite/negative data and keeps an open tooltip synchronized
  with controlled updates or slice removal.
- Nested `dataKind` append and range validation now tolerate malformed external state, normalize
  reversed peer ranges, validate the parent form API, and isolate mutable form snapshots.
- Failed local-draft appends now retain the user's draft instead of clearing unsaved values.
- Object path extraction now preserves and removes present falsey values; custom response tags
  are also sanitized recursively without mutating a cloned source.
- The local lodash-compatible helpers now honor shorthand iteratees, sparse-array semantics,
  unordered deep Map/Set equality, safe merge behavior, and prototype-pollution guards.
- Table-cell mapping now retains inherited relative context, table `extraItems` are resolved
  immutably on every render, and removable inputs tolerate a missing Form API.
- Plain-text API failures now reach the error popup instead of failing during JSON parsing.
- Dropzone accept patterns written as extensions also match on MIME type, so a `.jpeg` filter still
  accepts `photo.jpg` — or a file with no extension — that the browser typed as `image/jpeg`.
- InputDate now forwards focus and blur to Final Form, uses rc-picker's readonly contract,
  respects custom date formats, and safely normalizes empty, invalid, and default values. The
  configured format is tried strictly first, then a lenient reading, so a stored value in an
  unlisted shape (`2021-1-2`, `2021/01/02`, `Jan 2, 2021`) still renders rather than showing
  blank — which reads as "unset" and invites overwriting a good date.
- Controlled ProgressSteps updates no longer call a missing method, explicit index zero wins over
  defaults, and controlled rerenders or item removal cancel stale delayed clicks.
- Storage helpers now route through the configured backend adapter outside the browser, preserve
  `null`, and switch reliably between asynchronous and synchronous adapters.
- Leading debounce calls correctly start a new window after the previous window expires while
  retaining the latest trailing call for bursts.
- Counter animations now retain every frame when timers coincide, finish on the exact target,
  restart after timing/easing changes, clear stale work, and safely bound invalid timing inputs.
- Hidden inputs preserve their name, ID, disabled state, and form submission behavior; sticky
  placeholders now tolerate default, numeric, and zero values.
- ToggleField now falls back to the active field translator when no explicit translator is passed.
- Pagination rejects unusable totals, normalizes out-of-range pages and layout counts, keeps the
  normalized current page inert, and exposes a named navigation landmark.
- Readonly checkboxes now prevent native checked-state changes while preserving click callbacks.
- ProgressBar clears stale mount timers on value updates, normalizes missing/invalid progress,
  preserves numeric-zero labels/tooltips, and no longer leaks component-only props to the DOM.
- Definition/localisation helpers reject duplicate null-valued keys, ignore inherited entries,
  preserve object prototypes for reserved keys, and retain initial translations during updates.
- The timer decorator now implements its documented interval API, clears both timer types, and
  resets its registries after manual cleanup or unmount.
- Duration formatting returns a stable zero for non-finite input and, with rounding disabled,
  chooses the first meaningful unit when the output is limited.
- Number helpers now tolerate empty ranges, format custom-delimiter negative zero and grouped
  ordinals correctly, keep non-finite SI values suffix-free, and handle numeric-string zeroes in
  divisor and percentage calculations.
- Index-based Select reordering now rejects empty, fractional, negative, out-of-range, and sparse
  selections without deleting the selection or inserting `undefined`. The options array is still
  identified by a truthy label on its first element: matching on mere key presence also reordered
  unrelated arrays that happened to carry the key with a falsey value.
- Select controls derive their accessible name from the visible label, then the field name, with a
  generic fallback when neither is available; null labels still do not create visible placeholders.
- Equal-length string merging now uses both inputs, and merging with an empty string no longer
  emits `undefined` fragments.
- Page-level Tabs now prioritize controlled index zero, normalize indices after item removal,
  apply opt-in prop transitions consistently, and render text-only object labels safely. A pending
  transition is no longer cancelled when the items array is rebuilt — the mapper rebuilds it on
  every render, so that cancelled the click of any host re-rendering inside the 50 ms window. The
  target index is revalidated when the timer fires instead.
- Render setup failures now report the missing component or method resolver before React attempts
  to render an invalid element, while recursive child failures remain isolated to their subtree.
- Mapper Data nodes fall back to root data for every falsey local value. A nested render needs an
  object to bind against, so passing `null`/`0`/`''`/`false` through made the whole block vanish:
  its inputs never mounted and their keys never reached the submitted payload.
- Nested Text metadata no longer leaks `renderLabel` or `currencyCode` into DOM elements.
- Final Form wrappers keep one subscription per active form, release it when the form changes,
  and unsubscribe during unmount.
- Popup actions filter React component classes before normalizing declarative IDs, avoiding an
  empty popup when a class is included alongside the click event.

### v0.34.3

#### Fixes

- A layout with `relativeData: false` no longer forces that flag onto a child that
  declares `relativeData` itself. A node such as
  `{view: 'RowList', name: 'Groups[0].Items', relativeData: true}` nested under such a
  layout skipped data resolution and rendered empty, while a sibling `Table` bound to
  the same path kept working, because only `view: 'Table'` was exempt from the
  inherited flag.
- Path resolution no longer hands out the whole data object for a path that resolves
  to nothing. `get(data, '')` returned `data` itself, and an empty path segment was
  dropped, so `get(data, 'a..b')` returned `data.a.b` and `get(data, 'a.')` returned
  `data.a`. A value definition such as a blank Table header label (`{name: ''}`) then
  resolved to the data object, and rendering it threw
  `Objects are not valid as a React child`.

#### Demo

- New example: **RowList: relativeData false ancestors** — a `RowList` and a `PieChart`
  nested under layouts that declare `relativeData: false`, alongside a `Table` bound to
  the same path.
- Added the missing `Input: Integer ≥ 0` example files, which the registry has imported
  since v0.34.1 without them being present.

### v0.34.2

#### Fixes

- Fixed `merge` helper in `lodash-lite` to overlay arrays by index instead of
  concatenating them, restoring lodash semantics.
- `getAllFormsData()` now strips the empty `renderExtraItem` draft row from
  `dataKind.*` arrays before returning.

### v0.34.1

#### Fixes

- **InputNumber** now enforces `min` and `outputFormat.decimals: 0` on entry, not
  only on blur formatting. With `min: 0`, the minus sign cannot be typed or pasted;
  with `outputFormat.decimals: 0`, the decimal separator (`.` or `,`) is rejected.
  The value is also clamped to `[min, max]` on blur, so legacy data outside the
  range is corrected when the field loses focus.
- **InputNumber** restored the visible gap between the input value and `unit`
  text (`234 USD` instead of `234USD`). The plain whitespace text node was
  collapsing as a whitespace-only anonymous flex item inside the unit container.

#### Demo

- New example: **Input: Integer ≥ 0** — demonstrates the `min: 0` +
  `outputFormat.decimals: 0` combination alongside an unconstrained input for
  contrast.

#### Tests

- New `InputNumber` test suite covering `min` enforcement, `decimals: 0`
  enforcement, the combined constraint, and `[min, max]` clamping on blur.

### v0.34.0

A focused cleanup release: the published bundle is now roughly **half the size**, the library
ships with far fewer third-party packages, and several built-in components got polish and tests.

#### What's smaller

- The published JavaScript bundle dropped from ~890 KB to ~410 KB. Apps using this library will
  download less code and start faster.
- Removed third-party dependencies that previously came bundled or as peers. Their features are
  preserved — they were rewritten in-house.

#### Installation note

Three packages remain as **peer dependencies**: `react`, `react-dom`, and `moment`. Host
applications must declare these themselves — see the README "Installation" section for the
install commands.

#### What's new

- **Pagination** for tables — set `usePagination: true` and `rowsPerPage` to paginate large
  tables. New demo example: "Table with Pagination".
- **Slider** improvements — smoother handle motion when clicking the track, tooltip stays a
  neutral colour during interaction, disabled sliders look grey instead of black, and marks at
  the start of a slider no longer pile up on each other (when using `step: null` with marks,
  the marks now spread evenly along the track). New demo example with several variants.
- **Upload** examples expanded — single CSV, multiple documents, image button, and read-only
  upload, plus a full attribute reference in the docs.
- **JsonView** is now a built-in component — collapsible nested object viewer with light/dark
  themes and proper handling of repeated references.
- **PieChart** redrawn with native SVG — same visual output, no chart-library dependency.

#### Fixes

- Tables no longer crash when a cell value is a plain object — they fall back to a JSON string.
- Period validation fix on the form layer (carried over from the previous branch work).

#### Tests

- New test suite for the Slider component.
- PieChart tests rewritten against the new SVG implementation.

#### Documentation

- New README "Installation (consumer)" section.
- Configuration docs expanded for Pagination, Upload, Slider and PieChart attributes (with
  notes on validation, keyboard, discrete-mark mode and runnable examples).

### v0.33.0

#### New
- **2-level nested dataKind tables** — Data components (`dataKind`) can now be nested inside other Data components (e.g. phases → line items). Add, remove, validation, and `showIf` work correctly across nesting levels. Each nested UIRender instance is isolated with its own form and dataKind registry scoped by parent path.
- `localDraft` prop on `Data` component — draft row values stay in local React state until Add, preventing empty `{}` from appearing in parent form values

#### Fixes
- Fix `integer` normalizer — handles empty strings and `NaN` gracefully

#### Tests
- Added unit and component tests for nested dataKind helpers, `LocalDraftTableRow`, `Data`, `mergeReplaceArrays`, `metaToProps` renderExtraItem

#### Demo
- Added example: Nested dataKind table (add/remove inner rows)

### v0.32.4
#### Fixes
- Fix `showIf` evaluating against reordered array data — `showIf` now uses raw form values (`getRawFormsData`) without Select array reordering, so array indices from `{state.xxx}` match the original data order

### v0.32.3
#### Fixes
- Fix `showIf` with `{state.xxx}` templates not updating after Select/Dropdown change — cached meta is now cleared on state change so templates re-resolve
- Fix `showIf.name` interpolation in mapper for edge cases where template is not yet resolved

### v0.32.2
#### Fixes
- Fix `showIf` with `{state.xxx}` templates not resolving in mapper — added interpolation before path lookup

### v0.32.1
#### Fixes
- Fix Select/Dropdown default: only auto-select first option for index-based selects, not for stable-value selects
- Fix Dropdown not clearing when parent resets value to `undefined` after initial mount
- Fix form field `onChange` fallback using raw value instead of parsed value when UIRender instance is absent
- Add `remark-gfm` plugin for GFM table rendering in documentation
- Documentation: added `mapOptions` configuration guide explaining index-based vs stable-value modes

### v0.32.0

#### New
- Cascading Select/Dropdown support — child options update automatically when parent selection changes
- Pre-initialize Select/Dropdown state from initial data (`initSelectStatesFromData`) so `{state.xxx}` interpolation resolves on first render
- Stable-value Select support — `mapOptions.value` can reference a data field (e.g. `id`) instead of `{index}`, with automatic value-to-index conversion for cascading
- `showIf` conditional display for Select/Dropdown fields
- Demo app: new Changelog component with syntax highlighting
- Demo app: new examples for cascading selects, stable-value selects, select reordering, and dropdown experience

#### Updated
- **recharts** upgraded from v1.8 to v2.15 — PieChart rewritten as a functional component with hooks, `Cell` rendered as JSX children (v2 API), fixed `dataNormalized` argument bug, eliminated module-level mutable state
- Updated PieChart demo example with neutral domain-agnostic data

#### Build & Infrastructure
- Migrated from `craco` to standalone Webpack configuration (`webpack.demo.config.mjs`)
- Webpack configs converted from `.js` to `.mjs` (ES modules)
- Library build now compiles LESS/CSS and outputs `dist/static/all.css` with CSS minification
- Added standalone CSS build script (`scripts/build-css.js`)
- Added `stylelint` for LESS linting
- Added Jest testing infrastructure with `jest.config.js`, `@testing-library/react`, `@testing-library/jest-dom`
- CSS contract tests to verify LESS compilation and baseline class inventory
- Replaced `ProvidePlugin(process)` with `DefinePlugin` in webpack configs
- Node.js engine requirement: `>=22`, `.nvmrc` updated to v24
- Updated dependencies: `recharts` v2.15, `react-syntax-highlighter` v16, `copy-webpack-plugin` v14, `css-minimizer-webpack-plugin` v8, `remark-gfm` v3

#### Fixes
- Fix cascading Select data corruption caused by stale closure in `react-final-form` — use `form.change()` instead of `input.onChange()` for field updates
- Fix Select `onChange` now applies to both Select and Dropdown (previously only Dropdown got auto-generated `setState` handler)
- Fix `mapOptions.value` default to `{index}` for Select fields (consistent with Dropdown)
- Dropdown resets value when options change and current value is no longer valid
- Pass `instance` to form fields for direct form state access

#### Tests
- Added unit tests for `toOpenLConfig`, `initSelectStatesFromData`, `changeOptionOrderForSelectFields`
- Added unit tests for `replaceDeep`, `mapErrorObjectToUIFormat`, `convertFieldNameToTitleCaseText`, `getDateStringFromDateObject`, `normalizeIncomingData`
- Added unit tests for `mapProps`, `getCurrencySymbol`, `interpolateString`
- Added component tests for Select (rendering, controlled/uncontrolled, onChange, accessibility)
- Added component tests for Dropdown (rendering, options handling, cascading reset, done state, search mode)
- Added CSS contract tests (LESS compilation, baseline class inventory, icon fonts, Semantic UI)

### v0.31.7
#### Fixes
- Fix table data display issue caused by relativeData propagation - tables now always extract data by name attribute regardless of parent relativeData setting

### v0.31.6
#### Fixes
- Fix popup input field names to correctly include relativePath and relativeIndex for proper form field identification
- Fix popup positioning to display centered on screen instead of at the top
- Ensure relativePath and relativeIndex are properly passed through Render component to nested popup fields

### v0.31.5
#### Fixes
- Improve InputNumber UX

### v0.31.4
#### Fixes
- Remove default sorting for PieChart component

### v0.31.3
#### Fixes
- Do not call onDataChange handler on new form data

### v0.31.2
#### Fixes
- Fix a text component to display fields with negative values

### v0.31.1
#### Fixes
- Fix a notification about changes in the form

### v0.31.0
- Reviewed and updated libraries
- Deleted redux
- Deleted global instance
- Simplified code / structure

### v0.30.22
- Refactoring

### v0.30.21
#### Fixes
- Fix DatePicker

### v0.30.20
#### Fixes
- Fix pagination styles

### v0.30.19
#### New
- Added `usePagination` and `rowsPerPage` attribute to Table component

### v0.30.18
#### Fixes
- Do not call external API on init

### v0.30.17
#### Fixes
- Fixed DatePicker styles

### v0.30.16
#### New
- Added label attribute to DatePicker component
#### Fixes
- Fixed DatePicker styles

### v0.30.15
#### New
- Added DatePicker component
- Added dateFormat attribute to show date in different formats

### v0.30.14
#### Fixes
- Fix build styles

### v0.30.13
#### Fixes
- Update currency on new meta is loaded

### v0.30.12
#### New
- Added root attribute `currencyCode`

### v0.30.11
#### Fixes
- Remove dependency

### v0.30.10
#### Fixes
- Entered date changes automatically when time zone is changed

### v0.30.9
#### Fixes
- Fix Input Number field to display number with 0 decimals

### v0.30.8
#### Fixes
- Fix form initial values

### v0.30.7
#### Fixes
- Fix validation message
- Validate date ranges using current form state
- Clear fields state on subform reset

### v0.30.6
#### Fixes
- Display errors on tabs switch
- Fix definition of input format function
- Normalize incoming data
- Fix table validation rules

### v0.30.2
#### Fixes
- Align behavior of InputNumber component with other inputs

### v0.30.1
#### Fixes
- Fixed error message displaying

### v0.30.0
#### New
- New Popup component with own context
#### Fixes
- Add parser for thousands separator in InputNumber component
- Use popup in parent UI-Render instance only
- Parse ReadableSteam to get Error message
- Fixed behavior for selects with reordered options

### v0.29.5
#### New
- Added final-form-arrays library to support nested arrays in forms
- Added ability to see the current data state on demo page
- Added percent formatting to InputNumber component
#### Fixes
- Fixed InputNumber component
- Truncate integer part of number to avoid rounding
- Fixed Input margins
- Added Popup component in UI-Render
- Use single instance of UI-Render with form wrapper 
- Added unique names for all fields 
- Format initial values in InputNumber component
- Fix date range validation and change validation message

### v0.29.4
#### Fixes
- Clear code base

### v0.29.3
#### New 
- Added Name attribute for checkboxes
- Added parsing data to define dataKind attribute on nested levels
- Ability to use not relative data in renderExtraItem attribute of tables
- New Input Number Component with ability to format output

#### Fixes
- Fixed behavior of Dropdowns in RowList view

### v0.29.2
#### Fixes
- Call onDataChanged listener every time on form was changed once

### v0.29.1
#### Fixes
- Rerender instance on file is uploaded

### v0.29.0
#### New
- Added `colGroup` attribute to define table column styles
- Added `isFixed` attribute to set sticky style for columns

### v0.28.7
#### Fixes
- Normalize date values to prevent errors

### v0.28.6
#### Fixes
- Fixed adding and deleting rows in tables
- Fixed styles of modals
- Change file processing flow to support integration with other apps

### v0.28.5
#### Fixes
- Avoid render field name on value is not provided
- Added Date type in renderLabel method

### v0.28.4
#### Fixes
- Normalize incoming data
- Restart forms with correct data on response

### v0.28.3
#### New
- Added `no-header` style for tables. Ability to not display table header
- Added `highlight-1-last`, `highlight-2-last`, `highlight-3-last` styles to highlight up to 3 last table rows
- Added `width-25p`, `width-50p`, `width-75p` styles. Content takes 25%, 50%, 75% of width
- Added type String for renderLabel method
#### Fixes
- Fixed runtime error then data.json provided without meta.json 

### v0.28.2
####  Fixes
- Add missed icons
- Return actual errors list through `getValidationErrors` listener
- Do not include to error list untouched fields

### v0.28.1
####  Fixes
- Format Date values in tables
- Add localization support for button title, checkbox, toggle, label
- Reinitialize form values on file was uploaded

### v0.28.0
#### New
- Select reorders options in Data object and invokes onDataChanged callback
- Added `translate` property which accept localization function
- Added `methods` property. Provided ability to add callback functions. This functions will be called on buttons with related `onClick` function names. For example:

**`meta.json`**
```json
{
  "view": "Button",
  "items": [
    {
      "view": "Text",
      "label": "Apply Periods"
    }
  ],
  "onClick": {
    "name": "onApplyPeriods"
  }
}
```
```jsx
<UIRender
  methods={{
    onApplyPeriods: this.onApplyPeriods,
  }}
/>
```
- Added `apiCalls` property for UI-Render component and `onApplyPeriods` listener for `Button` component. If `apiCalls` contain `updateExperienceData` method, it will be calls on click button with `onApplyPeriods` listener
- Added `downloadFile` and `uploadFile` methods into `apiCalls` property. They accept api calls to process 'download' and 'upload' events on fields

####  Fixes
- Add TS annotation for `getValidationErrors` listener

### v0.27.2
#### Fixes
- `onDataChanged` is called on any input change

### v0.27.1
#### Fixes
- The name of validation constant has been changed to avoid build crashes in production.

### v0.27.0
#### New
- Added `getValidationErrors` listener. Returns list of active validation errors
- Added `updateDataOnChange` for Toggle component. Uses in Meta config to update data object. Allow to change UI state to show/hide form controls
- Added `getFormData` callback. Provided ability to get actual data state of UI-Render
- Added `onDataChanged` listener. It is called every time on forms are changed from initials values
#### Fixes
- Date Input is allow to enter 4 digits for the year field 
- Generate unique IDs for nested UI-Render instances

### v0.26.3
#### Fixes
- Extract changed form values for nested Data Components before submission - [example](examples#tableForm)

### v0.26.2
#### New
- [Toggle Input](examples#inputToggle)
- [Download File Template](examples#buttonDownload)
- [Popup Content](examples#popupContent)

#### Fixes
- fix Input delete icon not working for `border-on-hover`
- fix Input validation message not showing on Tab changes
- fix Input cursor jumping when using `format`
- fix Date `format`
- fix e2e tests

### v0.26.0
#### New
- Upload file Input + [example](examples#upload)

#### Updated
- Upgraded major dependencies

#### Fixes
- Input nested inside Table not getting correct index

### v0.25.4
#### New
- Multiple UIRender instances on a Page
- [Data Component](examples#tableForm) for rendering nested UIRender instances
- Complex validation with multiple validator methods using `verify` attribute (see Data Component for examples)
- `notWithinRange` validation (see Data Component for examples)
- Input for date (see Data Component for examples)
- [Example Rating Details config](examples#ratingDetails)
- Cypress End-to-End Tests for Examples
- UIRender can be used directly with `data/meta` JS objects
- Docs available on GitHub Pages.

#### Updated
- ShowIf logic docs
- UIRender developer integration README.md
- Policy production build bundle instructions

#### Fixes
- relativePath for inputs nested in lists
- Localised translations not resolving in production
- Increased API timeout to 1 minute for production build

### v0.24.2
#### Removed
- **showEmptyAs** example

### v0.24.1
#### New Example
- [Example: **Summary Box**](examples#summaryBox)

### v0.24.0
#### New Features
- [Example: **Matrix Table**](examples#tableMatrix) (+ [minimum config](examples#tableMatrixRequired) example)
- [Example: **Tabs Buttoned**](examples#tabsButtoned) (+ [Tabs](examples#tabs) default example)
- [Example: **showEmptyAs**](examples#tableExtraItems) attribute for Table (cell value must be `null` or empty string for it to work)
- **onClickIcon** callback added for Dropdown to remove/delete Select field
- Localised validation messages
- Updated chevron icons to the latest DSM style guide.
  
#### Documentation Improvements
- [FAQ: **How to check UI Render Version**](faq)
- Examples: clicking `Meta.json` or `Data.json` will download respective `json` files.
- Examples: clicking links to `examples#id` with hash, like [this](examples#all), automatically opens the example. 
  In the same way, you can link to an example directly by first expanding it, then copying URL in the browser.
- Tabs shown in [`docs`](/ui-render) now sync with browser URL

#### Fixes
- Multiple Form instances for UI Render on the same page
- **removable** attribute shows delete icon inside Input  
- **readonly** state for all form fields no longer hides the input if it has value
- **onRemove** Input Field sets form value to null for the Input

#### Removed
- **hideOnEmpty** attribute
  
### v0.23.1
#### Changes
- **showIf** can be empty object. The logic works like [this](configuration#showif-logic).
  

### v0.23.0

#### Breaking Changes
- **relativeData** pattern defaults to `true` if not defined. To use global data.json, do this:
  ```js
  { 
    "name": "path.to.data.json",
    "relativeData": false
  }
  ```
- [Show If condition example updated](examples#showIf)


### v0.22.0

#### New Features
- [Styles documentation](styles)
- [Configuration docs updated](configuration)
- [Show If condition](examples#showIf)
- **Truthy** evaluation: if a value used in `showIf` or `hideOnEmpty` matches listed values below, it is considered `empty` (i.e. **untruthy**):
    ```js
    const NON_TRUTHY_VALUES = [
        false,
        undefined,
        null,
        NaN,
        0,
        0.0,
        -0,
        +0,
        -0.0,
        +0.0,
        '',
        {},
        [],
    ]
    ```
    All other values are not empty (i.e. **truthy**) for evaluation when `equal` is undefined.

#### Bug Fixes
- **hideOnEmpty**: values listed above are now considered empty (i.e. **untruthy**)

#### Changes
- **hideOnEmpty** will be deprecated in the next release version
- Updated CSS styles to match the latest DSM style guide
- Refactored CSS variables and bundling process for UI Integration
- Refactored JS code bundling process for UI Integration
