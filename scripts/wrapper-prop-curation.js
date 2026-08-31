/**
 * The curated half of `docs/SUPPORTED-PROPS.md`.
 *
 * `scripts/generate-wrapper-prop-reference.js` derives the *inventories* from source —
 * which props each wrapper intercepts, which are stripped at the DOM boundary, which are
 * written onto the `semantic-ui-react` element, which files import SUIR at all. It cannot
 * derive what a prop MEANS, nor whether any real meta.json uses it. That is what lives here.
 *
 * THE THREE OUTCOMES, AND WHY THE SPLIT IS THE POINT
 * -----------------------------------------------------------------------------
 * "A prop appears in a meta" is not "a prop reaches semantic-ui-react". Every prop on one
 * of the three wrapped views has exactly one of three fates, and they are three different
 * promises to a consumer:
 *
 *   consumed   the wrapper (or its engine caller) reads it and it never reaches SUIR.
 *              WE own the behaviour. §9.7-F1 steps 1-3 must keep it working, and the swap
 *              cannot change it — there is nothing on the other side of the swap to change.
 *   stripped   removed at the DOM boundary by `components/domProps.js`. Load-bearing as a
 *              prop, never an HTML attribute. Only the boundary changes at the swap.
 *   forwarded  handed to semantic-ui-react, whose own code decides what happens. THIS is
 *              the parity checklist: a replacement has to reproduce SUIR's behaviour for
 *              each of these, or the prop silently stops working.
 *
 * Conflating them would produce a checklist full of props that never mattered.
 *
 * TIERS, FOR THE FORWARDED SET ONLY
 * -----------------------------------------------------------------------------
 *   1  exercised in the wild — used by a node in the tracked example corpus, or by one of
 *      the consumer metas audited in step 0, or generated unconditionally by the wrapper.
 *      Must be reproduced exactly; a regression here is a live bug.
 *   2  published but unexercised — reachable through the wrapper's documented API
 *      (JSDoc/propTypes) or by passthrough, but no meta in either corpus uses it. These
 *      cannot be silently dropped, but reimplement-vs-deprecate is an owners' decision in
 *      the step PR, not a default L-cost obligation.
 *
 * `source` records WHERE a tier-1 prop was seen, because the demo corpus is not the whole
 * truth: three props are used only by consumer metas and a demo-derived checklist misses
 * them. Consumer metas are untracked working files (§0.8) and are NOT re-scanned by CI, so
 * `source: 'consumer'` is a step-0 audit finding, pinned here rather than re-derived.
 *
 * HOW THIS FILE IS KEPT HONEST
 * -----------------------------------------------------------------------------
 *  - the generator fails if a wrapper prop has no entry here, or if an entry names a prop
 *    the wrapper no longer intercepts;
 *  - the generator fails if a `via: 'element'` / `'generated'` entry disagrees with what the
 *    wrapper source actually does;
 *  - `scripts/__tests__/wrapper-prop-reference.contract.test.js` walks every tracked example
 *    meta and fails if META_ATTRIBUTES is not exactly the set of attribute names the corpus
 *    puts on these views.
 */

/**
 * Per wrapper: the prose the page opens each section with, plus one line for every prop the
 * wrapper intercepts itself (the derived `consumed` set — this map must cover it exactly).
 *
 * `cssContract` is the constraint the replacement inherits from our OWN LESS: the emitted
 * classNames are load-bearing, so "in-house markup" is not free to be clean markup.
 */
const WRAPPER_CURATION = {
    Table: {
        summary: 'Markup sugar over a native `<table>`. Semantic\'s own table CSS is not loaded '
            + '(`collections/table` is commented out in `src/style/override/_semantic.less`), so every '
            + 'table style in the product is already in-house LESS.',
        cssContract: 'SUIR\'s `Table` always emits `ui` and `table` in its className, and '
            + '`src/style/components/table.less:125` hangs every table cell\'s padding off `.ui.table`. '
            + 'A native `<table>` that stops emitting `ui table` loses all cell padding — so §9.7-F1.1 is '
            + 'right that visual parity is near-guaranteed, but only because the replacement keeps emitting '
            + 'those two tokens. `src/style/components/expand.less` keys off `.striped` and `.inverted` the '
            + 'same way. The `.ui.dropdown` half of this contract is already pinned by '
            + '`src/style/__tests__/css.compilation.test.js`.',
        props: {
            fixedHeader: 'Wraps the table in two scroll containers so the header stays visible. '
                + 'Wrapper-only, and unused: no meta in either corpus sets it and no call site passes it.',
        },
    },
    TooltipPop: {
        summary: 'Hover tooltip over SUIR `Popup`. Reached two ways: a `view: "Tooltip"` node '
            + '(`mapper.js`, which maps `label` to `content`), and the `tooltip` attribute on ANY node '
            + '(`Render.js`, which wraps the rendered node and spreads `tooltip` when it is an object — '
            + 'so an object `tooltip` is an unfiltered passthrough into SUIR).',
        cssContract: 'The loaded `modules/popup` LESS styles `.ui.<placement>.popup.transition.visible` '
            + 'and its inner `.content`; SUIR renders that markup through a `Portal`. The replacement has '
            + 'to emit the same structure until step 4 re-homes the CSS.',
        props: {
            title: 'The tooltip body. Forwarded as SUIR `content`. A function value is wrapped as '
                + '`{children: fn}` — the workaround for Semantic-Org/Semantic-UI-React#4029.',
            children: 'The trigger element. Forwarded as SUIR `trigger`.',
            delay: 'Milliseconds before the tooltip opens; default 500, deliberately slower than '
                + 'Semantic\'s own 50 ms. Forwarded as `mouseEnterDelay`.',
            inverted: 'Dark colour scheme. Intercepted and re-passed under the same name, so it also '
                + 'reaches the emitted className. Always true from both entry points.',
        },
    },
    Dropdown: {
        summary: 'The wrapper already owns the external API: the `onChange(value, name, event)` '
            + 'signature, option sanitisation, case-insensitive dedup on addition, and the cascading '
            + 'reset are all wrapper code and are keepers. Only the `<DropDown/>` element at the bottom '
            + 'is replaced. Two entry points, and they differ: `mapper.js` imports the memoised default '
            + 'export for `view: "Dropdown"`, while `modules/form/inputs/DropdownField.js` imports the '
            + 'NAMED export for `view: "Select"` — which is the majority path.',
        cssContract: 'The loaded `modules/dropdown` LESS is the largest single semantic module in the '
            + 'compiled CSS and is keyed almost entirely on `.ui.selection.dropdown`. SUIR builds that '
            + 'className from `ui`, the active/disabled/error/compact/multiple/search/selection/upward '
            + 'modifiers, then `dropdown`, then ours. Steps 3 and 4 are therefore more coupled for this '
            + 'component than the roadmap implies: in-house markup must keep emitting the modifier tokens '
            + 'until the CSS is re-homed.',
        strippedNote: '`name` is the interesting one: SUIR declares no `name` and renders no hidden '
            + 'native input, so stripping it costs nothing on the DOM — but it is still what '
            + '`onChange(value, name, event)` reports and what react-final-form registers the field '
            + 'under, and the strip deliberately happens AFTER the handler closures are built.',
        props: {
            options: 'Option list: strings, numbers, or `{text, value, key, content, disabled}` objects. '
                + 'Sanitised into a fresh array (translation, `value`-from-`text` defaulting, `optionsLabel` '
                + 'appended) and held in wrapper state so additions can extend it. The array SUIR receives '
                + 'is never the array the caller passed.',
            onChange: 'Called as `onChange(value, name, event)` — the wrapper\'s own signature, not '
                + 'Semantic\'s `(event, data)`. Also where case-insensitive duplicate collapsing happens.',
            onSelect: 'Called on close with the last committed value, same `(value, name, event)` shape. '
                + 'Implemented by handing SUIR an `onClose`.',
            onSearch: 'Called with the typed query, `(query, name, event)`. Implemented by handing SUIR '
                + 'an `onSearchChange`.',
            onAddItem: 'Called when a new option is added, `(value, name, event)`. Requires '
                + '`allowAdditions`; the wrapper dedups against existing options first.',
            label: 'Visible label text, rendered by the wrapper as its own `<Text>` before or after the '
                + 'control depending on `float`. CONSUMED, not stripped: it is destructured out at the '
                + 'top of the wrapper, so it can never be in the rest bag that `omitProps` filters.',
            placeholder: 'Placeholder text, translated by the wrapper and then forwarded to SUIR.',
            done: 'Adds a `done` class to the wrapper. Defaulted from `props.value` — which is always '
                + '`undefined`, because `value` was destructured out, so the class is unreachable from a '
                + 'value today. Do not port the defaulting faithfully; fix it or drop it.',
            error: 'Message shown under the control. The wrapper renders the text itself and forwards '
                + 'only `error={!!error}` to SUIR for the class.',
            info: 'Explanatory message under the control. Also adds an `info` class.',
            float: 'Renders the label after the control (float-label layout).',
            className: 'Composed by the wrapper onto its own `input--wrapper` element; only the derived '
                + '`{info, readonly}` classes go to SUIR.',
            classNameIcon: 'Class for the icon node the wrapper builds when `onClickIcon` is given.',
            style: 'Inline style, applied to the wrapper element, not to SUIR.',
            fill: 'Adds `fill-width` unless `compact`. Default true.',
            lazyLoad: 'Defer rendering options until opened; default true, and `mapper.js` passes false '
                + 'on the `view: "Dropdown"` path. Forwarded to SUIR unchanged.',
            optionsLabel: 'Extra disabled option appended to the bottom of the list.',
            initialValues: 'Accepted and discarded — it exists only to keep the form stack\'s '
                + '`initialValues` off the DOM.',
            readonly: 'Translated to SUIR `disabled` plus a `readonly` class, because Semantic\'s '
                + 'Dropdown has no `readOnly`.',
            autofocus: 'Translated to SUIR `searchInput={{autoFocus: true}}`, so it only does anything '
                + 'together with `search`.',
            onClickIcon: 'Replaces the icon with a clickable `<Icon>` node, because Semantic has no '
                + 'icon-click callback.',
            translate: 'The i18n function. Engine-owned, applied to option text, `label` and '
                + '`placeholder`. CONSUMED, not stripped — destructured out at the top of the wrapper. '
                + 'It is also in ENGINE_PROPS, which is what catches it at other boundaries.',
            value: 'Selected value. Held in wrapper state, synced from the prop, and array values are '
                + 'joined before being forwarded — so what SUIR sees is not always what the caller passed.',
        },
    },
}

/**
 * Every prop that reaches semantic-ui-react, by wrapper.
 *
 * `via` says HOW it gets there, and the generator checks it against the wrapper source:
 *   'element'    written as a JSX attribute on the SUIR element (derived; must match)
 *   'generated'  assigned onto the rest bag by wrapper logic (derived; must match)
 *   'rest'       rides the rest spread straight from the caller (NOT derivable — the whole
 *                point of a rest spread is that it is open. Curated from the corpus audit.)
 *
 * A `rest` entry that the generator finds among the element/generated names is stale and
 * fails the build, and vice versa.
 */
const FORWARDED_CURATION = {
    Table: {
        children: { via: 'rest', tier: 1, source: 'demo', summary: 'The row/section tree. Every table in both corpora.' },
        className: { via: 'rest', tier: 1, source: 'demo', summary: 'Composed by SUIR as `ui <modifiers> table <className>`. `TableView` builds it from the meta `styles`/`fill`/`vertical` attributes.' },
        inverted: { via: 'rest', tier: 2, source: null, summary: 'Dark table. Reached only from `ErrorTable.js`, whose own importer `ErrorContent.js` has no importers — both are §9.9-H1 orphans. Decide `inverted`/`striped` together with that deletion.' },
        striped: { via: 'rest', tier: 2, source: null, summary: 'Zebra rows. Same orphan path as `inverted`, but `src/style/components/expand.less` does key off a `.striped` ancestor, so the token is not inert if the component survives.' },
        celled: { via: 'rest', tier: 2, source: null, summary: 'Not used anywhere in either corpus, and Semantic\'s table CSS is not loaded, so it would be inert markup even if passed.' },
        textAlign: { via: 'rest', tier: 2, source: null, summary: 'Same as `celled`: no occurrences, no loaded CSS.' },
        as: { via: 'rest', tier: 2, source: null, summary: 'Element override. No occurrences; a replacement may legitimately drop it.' },
    },
    'Table.Cell': {
        children: { via: 'rest', tier: 1, source: 'demo', summary: 'Cell content.' },
        className: { via: 'rest', tier: 1, source: 'demo', summary: 'From the meta header `classNameCell`/`classNameCellWrap`, plus `TableView`\'s own tokens.' },
        style: { via: 'rest', tier: 1, source: 'demo', summary: 'From the meta header `styleCell`. Unhandled by SUIR, so it lands on the `<td>` as-is.' },
        colSpan: { via: 'rest', tier: 1, source: 'demo', summary: 'Spans the row for the empty-table and extra-item rows. Unhandled by SUIR, so it lands on the `<td>` as-is.' },
        verticalAlign: { via: 'rest', tier: 1, source: 'demo', summary: 'Only `LocalDraftTableRow` passes it; SUIR turns it into `top aligned`, and the compiled CSS has NO `aligned` rules — inert markup today. Reproducing the class is optional; deciding deliberately is not.' },
        scope: { via: 'rest', tier: 2, source: null, summary: 'Only `ErrorTable.js` (orphan). Unhandled by SUIR, so it reaches the `<td>`.' },
    },
    'Table.HeaderCell': {
        children: { via: 'rest', tier: 1, source: 'demo', summary: 'Header content.' },
        className: { via: 'rest', tier: 1, source: 'demo', summary: 'From the meta header `classNameHeader`, plus `TableView`\'s `left`.' },
        style: { via: 'rest', tier: 1, source: 'demo', summary: 'From the meta header `styleHeader`.' },
        colSpan: { via: 'rest', tier: 1, source: 'demo', summary: 'From the meta header `colSpan`.' },
    },
    'Table.Row': {
        children: { via: 'rest', tier: 1, source: 'demo', summary: 'The cells of one row.' },
        className: { via: 'rest', tier: 1, source: 'demo', summary: 'From the meta `itemClassNames`.' },
    },
    'Table.Header': {
        children: { via: 'rest', tier: 1, source: 'demo', summary: 'The header rows.' },
        className: { via: 'rest', tier: 1, source: 'demo', summary: '`TableView` passes a constant `font-normal`.' },
    },
    'Table.Body': {
        children: { via: 'rest', tier: 1, source: 'demo', summary: 'The body rows.' },
    },
    'Table.Footer': {
        children: { via: 'rest', tier: 2, source: null, summary: 'Re-exported but never rendered by anything in `src`.' },
    },
    TooltipPop: {
        inverted: { via: 'element', tier: 1, source: 'demo', summary: 'Always set from both entry points. Adds `inverted` to the popup className.' },
        trigger: { via: 'element', tier: 1, source: 'demo', summary: 'The element the tooltip hangs off. Comes from `children`; a caller may override it through the rest spread, which is spread last.' },
        content: { via: 'element', tier: 1, source: 'demo', summary: 'The tooltip body, from `title`. `mapper.js` maps a `view: "Tooltip"` node\'s `label` to `content` directly, so on that path `content` arrives through the rest spread and wins over `title`.' },
        mouseEnterDelay: { via: 'element', tier: 1, source: 'demo', summary: 'From `delay`. SUIR does not declare it on `Popup`, only on `Portal`, and the wrapper\'s spread lands after the portal defaults — so the 500 ms does take effect.' },
        position: { via: 'rest', tier: 2, source: null, summary: 'Placement, SUIR default `top left`. No meta in either corpus passes it; the only code that configures it (`components/utils/components.js`) has no non-test importer.' },
        on: { via: 'rest', tier: 2, source: null, summary: 'Trigger events, SUIR default `[\'click\', \'hover\']` — so today\'s tooltip also opens on CLICK and does NOT open on focus. Reproducing that exactly, or fixing it, is a step-2 decision.' },
        hoverable: { via: 'rest', tier: 2, source: null, summary: 'Keeps the popup open while the pointer is over it. No occurrences.' },
        basic: { via: 'rest', tier: 2, source: null, summary: 'Borderless style. No occurrences.' },
    },
    Dropdown: {
        className: { via: 'element', tier: 1, source: 'demo', summary: 'Only the wrapper-derived `{info, readonly}` classes; the caller\'s `className` goes to the wrapper element instead.' },
        options: { via: 'element', tier: 1, source: 'demo', summary: 'The sanitised array. Always an array of `{text, value, ...}` objects by the time SUIR sees it.' },
        placeholder: { via: 'element', tier: 1, source: 'demo', summary: 'Translated placeholder.' },
        error: { via: 'element', tier: 1, source: 'demo', summary: 'Coerced to boolean; drives the `error` class only.' },
        lazyLoad: { via: 'element', tier: 1, source: 'demo', summary: 'When true and closed, SUIR renders no options at all. Load-bearing for the initial DOM.' },
        noResultsMessage: { via: 'element', tier: 1, source: 'demo', summary: 'Computed by the wrapper, but SUIR only renders it when `search` is on — so the `NO_OPTIONS_LEFT`/`NOTHING_FOUND` computation is dead in both corpora. Do not port it as a requirement.' },
        value: { via: 'element', tier: 1, source: 'demo', summary: 'Wrapper state, with array values joined to a string. `selectOnNavigation` and `selectOnBlur` both default true in SUIR, which is the commit-as-you-move behaviour the contract suite pins.' },
        selection: { via: 'generated', tier: 1, source: 'demo', summary: 'Defaulted to true by the wrapper unless the caller says otherwise. This is what makes the className `ui selection dropdown`, which is what almost all the loaded dropdown CSS selects on.' },
        disabled: { via: 'generated', tier: 1, source: 'consumer', summary: 'Set by the wrapper from `readonly`, and passed directly by consumer metas (`view: "Select"`). Adds the `disabled` class, which IS styled, and sets `tabIndex=-1`.' },
        deburr: { via: 'generated', tier: 2, source: null, summary: 'Defaulted to true by the wrapper, but only when `search` is set — which nothing sets.' },
        icon: { via: 'generated', tier: 2, source: null, summary: 'Replaced with a node only when `onClickIcon` is given. No occurrences.' },
        searchInput: { via: 'generated', tier: 2, source: null, summary: 'Set only from `autofocus`. No occurrences.' },
        onChange: { via: 'generated', tier: 1, source: 'demo', summary: 'The wrapper\'s adapter, which is where the `(value, name, event)` signature and the duplicate collapsing live. SUIR calls it `(event, data)`.' },
        onClose: { via: 'generated', tier: 2, source: null, summary: 'Set only from `onSelect`. No occurrences in either corpus.' },
        onSearchChange: { via: 'generated', tier: 2, source: null, summary: 'Set only from `onSearch`. No occurrences.' },
        onAddItem: { via: 'generated', tier: 2, source: null, summary: 'Set only under `allowAdditions`. No occurrences.' },
        additionLabel: { via: 'generated', tier: 2, source: null, summary: 'Set only under `allowAdditions`.' },
        additionPosition: { via: 'generated', tier: 2, source: null, summary: 'Set only under `allowAdditions`.' },
        compact: { via: 'rest', tier: 1, source: 'demo', summary: 'Narrow control. Used by both corpora, and also suppresses the wrapper\'s `fill-width`.' },
        upward: { via: 'rest', tier: 1, source: 'consumer', summary: 'Opens the menu upward. Consumer metas only — a demo-derived checklist misses it. It is an autoControlled prop in SUIR: left unset, SUIR measures viewport space and flips by itself, so a replacement owes both the prop AND the auto-flip.' },
        onFocus: { via: 'rest', tier: 1, source: 'demo', summary: 'Arrives from the react-final-form adapter on the `view: "Select"` path.' },
        onBlur: { via: 'rest', tier: 1, source: 'demo', summary: 'Also from the form adapter. With SUIR\'s `selectOnBlur` default this participates in committing a value, so it is not merely a notification.' },
        id: { via: 'rest', tier: 1, source: 'demo', summary: 'Unhandled by SUIR, so it lands on the `<div role="listbox">`.' },
        type: { via: 'rest', tier: 1, source: 'demo', summary: 'A react-final-form artefact that arrives as `undefined`, so no attribute is emitted. Nothing to reproduce; listed so a replacement is not surprised to receive it.' },
        checked: { via: 'rest', tier: 1, source: 'demo', summary: 'A react-final-form artefact, also always `undefined`. Nothing to reproduce.' },
        search: { via: 'rest', tier: 2, source: null, summary: 'Type-to-filter combobox. §9.7-F1.1 called this "the real work" — but ZERO nodes in the 38 tracked examples and ZERO in the consumer metas set it. Same for `multiple`, `allowAdditions` and `clearable`. This is the single biggest scope datum in the step-0 audit.' },
        multiple: { via: 'rest', tier: 2, source: null, summary: 'Multi-select, rendered by SUIR as `ui label` chips. No occurrences on any Select/Dropdown node in either corpus. The wrapper has real `multiple` logic — dedup, array handling, `last()` semantics in `onChange` — which becomes unreachable code if the prop is dropped, so this decision is also a wrapper-cleanup decision.' },
        allowAdditions: { via: 'rest', tier: 2, source: null, summary: 'User-created options. No occurrences; gates a third of the wrapper\'s own logic.' },
        clearable: { via: 'rest', tier: 2, source: null, summary: 'Clear icon. No occurrences.' },
        required: { via: 'rest', tier: 2, source: null, summary: 'Read by the wrapper for its own `required` class and also forwarded. No occurrences on these views.' },
    },
}

/**
 * Every attribute name the TRACKED example corpus puts on a node of each wrapped view.
 * Enforced total, both directions, by the contract test — add an example that uses a new
 * attribute and the test names it.
 *
 * This is the "discovered set" §9.7-F1 step 0 asked for. Read it as an inventory, not as a
 * forwarding claim: most of these are consumed by `mapper.js`/`TableView.js` and never reach
 * semantic-ui-react at all. The `outcome` column on the page says which is which.
 */
const META_ATTRIBUTES = {
    Table: [
        '@class', 'extraHeaders', 'extraItems', 'filterItems', 'group', 'headers', 'itemClassNames',
        'itemsExpanded', 'name', 'relativeData', 'renderExtraItem', 'renderItem', 'renderItemCells',
        'rowsPerPage', 'showIf', 'sorts', 'styles', 'usePagination', 'vertical', 'view',
    ],
    'Table headers[]': [
        '@class', 'className', 'classNameCell', 'classNameCellWrap', 'classNameHeader', 'id', 'label',
        'renderCell', 'renderHeader', 'styleHeader',
    ],
    Tooltip: ['children', 'label', 'view'],
    Select: [
        'compact', 'label', 'mapOptions', 'name', 'onChange', 'options', 'placeholder', 'styles', 'view',
    ],
    Dropdown: [
        '@class', 'compact', 'mapOptions', 'name', 'onChange', 'options', 'placeholder', 'style',
        'styles', 'value', 'view',
    ],
}

/**
 * Attribute names found ONLY in the consumer metas during the step-0 audit, by view.
 *
 * Kept separate and NOT machine-checked on purpose: those files are untracked working files
 * (§0.8) and CI never sees them. They are recorded because two of them (`upward`, `disabled`)
 * reach semantic-ui-react and are styled, so a checklist derived from the demo corpus alone
 * would be wrong. Only semantic-ui-react / meta API prop names appear here.
 */
const CONSUMER_ONLY_ATTRIBUTES = {
    Table: ['colGroup'],
    'Table headers[]': ['renderLabel'],
    Select: ['disabled', 'upward', 'validate'],
    Dropdown: [],
    Tooltip: [],
}

/**
 * What each step owes, over and above "the props above still work". These are the obligations
 * the step-0 audit found that §9.7-F1.2 did not already state.
 */
const STEP_OBLIGATIONS = [
    {
        step: 'Step 1 — `Table`',
        effort: 'S (unchanged, arguably smaller)',
        items: [
            'Keep emitting `ui` and `table` on the root element, or every table cell loses its padding.',
            'Apply `omitProps` inside the new `Table.Cell`: `mapper.js` spreads a node\'s whole rest bag onto it, and that spread is unfiltered today.',
            'Decide `verticalAlign` deliberately — SUIR emits `top aligned` and no loaded CSS selects on `aligned`.',
            'Decide `inverted`/`striped` together with the §9.9-H1 deletion of `ErrorTable`/`ErrorContent`; they are the only source of both.',
            '`jest.config.js` sets a per-file threshold for `TableView.js` and none for `Table.js` — a real in-house `Table.js` wants its own entry.',
        ],
    },
    {
        step: 'Step 2 — `TooltipPop`',
        effort: 'S–M (unchanged, but the risk moved)',
        items: [
            'The tracked corpus renders ZERO tooltips: the only `view: "Tooltip"` node and the only `tooltip` attribute both sit in a non-active `Tabs` panel of one example, and the consumer metas contain none at all. Verifiable in the baseline itself — neither trigger label, and no popup markup, appears anywhere in the 38 snapshots. So the 38-snapshot DOM baseline cannot catch a tooltip regression at all; the whole gate is the 5 tooltip cases in `UIRender.overlay-behavior.test.js` plus the SUIR-mocked wrapper unit test.',
            'This is an unfiltered DOM boundary: the wrapper spreads its rest bag onto SUIR, which spreads what it does not recognise onto the popup `<div>`. Apply `omitProps` in the replacement.',
            'Decide whether to keep SUIR\'s `on: [\'click\', \'hover\']` default — the tooltip opens on click and does not open on focus — or to fix it to hover+focus.',
            'Losing SUIR also loses `@popperjs/core`/`react-popper`, so §9.7-F1.2\'s zero-dependency option (b) would be a regression against today: no flip, no overflow handling.',
        ],
    },
    {
        step: 'Step 3 — `Dropdown`',
        effort: 'L (unchanged size, different location)',
        items: [
            'The L is NOT in `search`/`multiple`/`allowAdditions`/`clearable` — nothing uses them. It is in the keyboard/a11y matrix, the cascading flows, `upward`\'s auto-flip, and the `.ui.selection.dropdown` CSS contract.',
            'Keep `displayName = \'Dropdown\'` AND the named-vs-default export split: `modules/form/utils.js` branches on `InputComponent.displayName`, and only the named export carries it — `React.memo(...)` does not.',
            'Reproduce SUIR\'s aria shape: `role="listbox"` (or `combobox` under `search`), `aria-expanded`, `aria-disabled`, `tabIndex=-1` when disabled. SUIR renders no hidden native input, so the form binding is entirely react-final-form.',
            'Decide tier 2 explicitly: reimplement or deprecate. They are published propTypes/JSDoc, so they cannot be dropped silently — but they are not evidence for an L estimate either.',
        ],
    },
]

module.exports = {
    WRAPPER_CURATION,
    FORWARDED_CURATION,
    META_ATTRIBUTES,
    CONSUMER_ONLY_ATTRIBUTES,
    STEP_OBLIGATIONS,
}
