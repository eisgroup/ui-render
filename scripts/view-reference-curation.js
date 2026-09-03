/**
 * CURATED PROSE FOR THE GENERATED VIEW REFERENCE ==============================
 *
 * This file is the *human* half of `docs/SUPPORTED-VIEWS.md`. The other half —
 * which `view` strings exist, and which of them the resolver actually handles —
 * is read out of the source by `scripts/generate-view-reference.js` and is
 * never written here. See UPGRADE-PLAN §9.4, "Generated view-type reference".
 *
 * The split matters, so it is worth stating flatly:
 *
 *   DERIVED (do not restate here)   the `view`/`render*`/action string itself,
 *                                   which declaration file it comes from, and
 *                                   whether a resolver case handles it.
 *   CURATED (only here)             the one-line description, the component or
 *                                   field the resolver hands the node to, and
 *                                   any note a meta author needs.
 *
 * The generator enforces that this mapping stays total in both directions: a new
 * `FIELD.TYPE`/`FIELD.RENDER`/`FIELD.ACTION` constant fails the check until it
 * is described here, and an entry whose constant was deleted fails too. It also
 * enforces the status/`resolvesTo` agreement — a view the resolver does not
 * handle must not claim to resolve to anything, and one it does handle must name
 * a symbol that really occurs in the resolver source.
 *
 * WRITING RULES
 * - One sentence, no `|` (it would break the markdown table), no newlines.
 * - Describe the meta.json contract, not the React internals.
 * - Say only what the source says. "No resolver case handles it" is a fact;
 *   "deprecated" or "planned" would be a guess. Several constants below are
 *   declared with an intent comment and no implementation — that comment is the
 *   only record of intent there is, and it is reported as exactly that.
 */

/**
 * `FIELD.TYPE` — meta.json `view` values.
 *
 * @type {Object<String, {summary: String, resolvesTo: ?String, notes: ?String}>}
 *   keyed by constant KEY (`FIELD.TYPE.<KEY>`)
 *   - summary     one line describing what a node with this `view` does
 *   - resolvesTo  component/field the resolver hands the node to; `null` for a
 *                 `view` no resolver case handles
 *   - notes       optional second line: aliases, gotchas, neighbouring views
 */
const VIEW_CURATION = {
    AUTO_SUBMIT: {
        summary: 'Renders no markup of its own and submits the form whenever the values it watches change.',
        resolvesTo: 'AutoSave',
        notes: '`onChange` is required; `delay` debounces it, `partial` sends only changed values and `showLoader` overlays a spinner while saving.',
    },
    BUTTON: {
        summary: 'Clickable button whose content comes from `items`, or from a plain `label` when there are no children.',
        resolvesTo: 'Button',
        notes: '`onClick` takes an action name or an action object — see the action table below.',
    },
    CHECKBOX: {
        summary: 'Standalone checkbox with an optional label, driven by the `value` and `onChange` props of the node.',
        resolvesTo: 'Checkbox',
        notes: 'Presentational only — it registers no form value. Use `Toggle`, or `Input` with `type: "toggle"`, for a form-bound checkbox.',
    },
    COL: {
        summary: 'Vertical flex container that renders `items` as its children.',
        resolvesTo: 'View',
        notes: 'Aliases: `Column`, `VerticalLayout`.',
    },
    COL2: {
        summary: 'Alias of `Col`.',
        resolvesTo: 'View',
        notes: null,
    },
    COL3: {
        summary: 'Alias of `Col`.',
        resolvesTo: 'View',
        notes: null,
    },
    COL_LIST: {
        summary: 'Alias of `List`.',
        resolvesTo: 'List',
        notes: null,
    },
    COL_LIST3: {
        summary: 'Alias of `List`.',
        resolvesTo: 'List',
        notes: null,
    },
    COUNTER: {
        summary: 'Number that animates from `start` to `end` when it mounts.',
        resolvesTo: 'Counter',
        notes: null,
    },
    DATA: {
        summary: 'Nested, independent render instance with its own form: `meta` carries the nested declaration, `data` or `name` selects its values, and `kind` groups sibling instances into one array for validation.',
        resolvesTo: 'Data',
        notes: 'Any falsy local value falls back to the root `data`, so the nested block still has an object to bind against.',
    },
    DATE: {
        summary: 'Declared for a standalone date field, but no resolver case handles it — author a date input as `view: "Input"` with `type: "date"`.',
        resolvesTo: null,
        notes: 'The same `"Date"` string is also `FIELD.RENDER.DATE`, which does work as a `render*` value; only the `view` is unreachable.',
    },
    DATES: {
        summary: 'Declared for multiple date ranges with `from` and `to` times, but no resolver case handles it.',
        resolvesTo: null,
        notes: null,
    },
    DROPDOWN: {
        summary: 'Option list that deliberately does not write a form value; its `onChange` is proxied so the handler receives the selected value alone.',
        resolvesTo: 'Dropdown',
        notes: '`mapOptions` builds `options` out of the node data. Use `Select` for the form-bound equivalent.',
    },
    EXPAND: {
        summary: 'Expanding and collapsing section with a clickable title, taking `items` as the collapsed content.',
        resolvesTo: 'Expand',
        notes: 'A `label`, or failing that a `name`, is promoted to `title` when no `title` is given.',
    },
    EXPAND_LIST: {
        summary: 'One `Expand` per entry of the node data, titled by `renderLabel` and filled by `renderItem`.',
        resolvesTo: 'ExpandList',
        notes: null,
    },
    GROUP: {
        summary: 'Declared for a group of semantically related fields, but no resolver case handles it.',
        resolvesTo: null,
        notes: null,
    },
    ICON: {
        summary: 'Icon named by its font class, with `items` rendered as its children.',
        resolvesTo: 'Icon',
        notes: null,
    },
    IMAGE: {
        summary: 'Image addressed by `name` plus optional `path`, or by a direct `src`.',
        resolvesTo: 'Image',
        notes: null,
    },
    INPUT: {
        summary: 'Form-bound input whose `type` picks the widget.',
        resolvesTo: 'InputField',
        notes: '`type` of `select`, `slider`, `toggle` or `file` re-dispatches the node as `Select`, `SliderLabel`, `Toggle` or `Upload`; `number` and `date` stay `Input` and resolve to the number and date fields; `min`/`max` on a number install a range validator; an `icon` object is rendered recursively.',
    },
    LABEL: {
        summary: 'A `<label>` element wrapping `items` as its children.',
        resolvesTo: 'Label',
        notes: null,
    },
    LINK: {
        summary: 'No resolver case handles it, and the constant carries no intent comment — the declaration is the only trace of it in the codebase.',
        resolvesTo: null,
        notes: 'Documented as unverifiable rather than guessed at; there is nothing in the source that says what it was meant to render.',
    },
    LIST: {
        summary: 'Renders the node data array through `renderItem` inside a vertical container.',
        resolvesTo: 'List',
        notes: 'Aliases: `ColList`, `VerticalList`. `RowList` and `HorizontalList` are the horizontal form.',
    },
    MULTIPLE: {
        summary: 'Declared for several fields of the same type side by side, but no resolver case handles it.',
        resolvesTo: null,
        notes: null,
    },
    MULTIPLE_LEVEL: {
        summary: 'Declared for several fields of the same type each carrying a value on a predefined scale, but no resolver case handles it.',
        resolvesTo: null,
        notes: null,
    },
    PIE_CHART: {
        summary: 'Pie or donut chart drawn as inline SVG from the node data.',
        resolvesTo: 'PieChart',
        notes: '`mapItems` maps each datum onto the chart shape; `legends`, `pointers` and `sort` control labelling and order.',
    },
    PLACE: {
        summary: 'Declared for a Google Places autocomplete field, but no resolver case handles it.',
        resolvesTo: null,
        notes: null,
    },
    POPUP: {
        summary: 'Registers its `items` on the render instance under `id` and renders nothing in place; the content is mounted only when the `popupOpen` action opens it.',
        resolvesTo: 'PopupContent',
        notes: 'An `id` containing `{...}` is kept as a template and interpolated at open time, so one declaration can serve many rows.',
    },
    PROGRESS_STEPS: {
        summary: 'Step indicator whose items each carry `step`, `label` and `content`, any of which may itself be a view declaration.',
        resolvesTo: 'ProgressSteps',
        notes: null,
    },
    ROW: {
        summary: 'Horizontal flex container that renders `items` as its children.',
        resolvesTo: 'Row',
        notes: 'Alias: `HorizontalLayout`.',
    },
    ROW2: {
        summary: 'Alias of `Row`.',
        resolvesTo: 'Row',
        notes: null,
    },
    ROW_LIST: {
        summary: 'Renders the node data array through `renderItem` inside a horizontal container.',
        resolvesTo: 'List',
        notes: 'Alias: `HorizontalList`. Same component as `List`, with the `row` flag set.',
    },
    ROW_LIST2: {
        summary: 'Alias of `RowList`.',
        resolvesTo: 'List',
        notes: null,
    },
    SELECT: {
        summary: 'Form-bound option list.',
        resolvesTo: 'DropdownField',
        notes: 'When `mapOptions.value` is something other than `{index}`, `onChange` is handed the option index instead of the value, so `{state.…}` paths and cascading selects keep working.',
    },
    SLIDER: {
        summary: 'Form-bound slider with a label.',
        resolvesTo: 'SliderField',
        notes: 'Also reached from `view: "Input"` with `type: "slider"`.',
    },
    SPACE: {
        summary: 'Empty spacer between sibling items.',
        resolvesTo: 'Space',
        notes: null,
    },
    TABLE: {
        summary: 'Table with dynamic `headers`, optional sorting, pagination, column groups and a `renderCell` declaration per header.',
        resolvesTo: 'TableView',
        notes: '`group` pivots rows into grouped columns, `extraItems` appends computed rows, `filterItems` keeps only rows matching the parent row, and the node `name` is expanded to the full dot-path its row inputs register under.',
    },
    TABLE_CELLS: {
        summary: 'Renders each entry of `items` inside its own table cell.',
        resolvesTo: 'Table.Cell',
        notes: 'Each cell inherits the row `relativePath` and `relativeIndex`, which is what keeps nested input names row-scoped (`path[0].field`, not `path.field`).',
    },
    TABS: {
        summary: 'Tab strip whose items each carry a `tab` and a `content`, either of which may be a nested view declaration.',
        resolvesTo: 'Tabs',
        notes: 'Items are consumed as `{tab, content}` pairs, so a `view` on an item is ignored — the `view: "Tab"` that several example metas carry resolves to nothing at all. `childrenBeforeTabs` and `childrenAfterTabs` render outside the strip.',
    },
    TAB_LIST: {
        summary: 'Tabs built from the node data array, labelled by `renderLabel` and filled by `renderItem`.',
        resolvesTo: 'TabList',
        notes: null,
    },
    TEXT: {
        summary: 'Text node whose content comes from `items`, from `renderLabel`, from a plain `label`, or from the value at `name`.',
        resolvesTo: 'Text',
        notes: null,
    },
    TITLE: {
        summary: 'A `Text` node with the `h3` class prepended, for consistent headings.',
        resolvesTo: 'Text',
        notes: null,
    },
    TOGGLE: {
        summary: 'Form-bound checkbox rendered as a toggle.',
        resolvesTo: 'ToggleField',
        notes: 'Also reached from `view: "Input"` with `type: "toggle"`.',
    },
    TOOLTIP: {
        summary: 'Tooltip whose body comes from `label` and whose trigger is a nested `children` or `items` declaration.',
        resolvesTo: 'TooltipPop',
        notes: 'A `label` is promoted to `content` when no `content` is given (`mapper.js:486`), and `content` is what the tooltip renders — it is an explicit alias for `title` that wins over it. Any node can also carry a `tooltip` attribute instead of using this view, and that attribute may be an object, whose properties are spread into the tooltip — narrowed at §9.7-F1 step 2 part 3 from the 45 names `semantic-ui-react` accepted to 13, with the 18 reachable-and-plausible ones warning once each in development. **Correction (step 2 part 1):** this entry once said `items` supplied the tooltip *body*; measured, `items` becomes the TRIGGER. **And a correction to that correction (step 2 part 3):** part 1 measured the `items` form as not rendering at all, because `semantic-ui-react` required the trigger to be exactly one element (`React.Children.only`) while `mapper.js` builds an array, so it threw and left the engine error diagnostic in the node\'s place. The in-house tooltip has no such restriction — the trigger is rendered as children, so `items` renders the trigger AND the tooltip. Both the old failure and the new behaviour are pinned in `UIRender.overlay-behavior.test.js`. **Opens on hover (after 500 ms) and on keyboard focus, NOT on click or tap** — the click gesture was dropped at step 2 part 3 because every tooltipped node owns its own `onClick`; see `docs/SUPPORTED-PROPS.md` under `dropped.on`.',
    },
    UPLOAD: {
        summary: 'Form-bound single file upload with drag and drop.',
        resolvesTo: 'UploadField',
        notes: 'Also reached from `view: "Input"` with `type: "file"`. Uploading is wired to the host `uploadFile` API call through the `upload` action.',
    },
    UPLOAD_GRID: {
        summary: 'Declared for multiple uploads in a grid layout, but no resolver case handles it.',
        resolvesTo: null,
        notes: null,
    },
    UPLOAD_GRIDS: {
        summary: 'Declared for several upload grids of different kinds as separate tabs, but no resolver case handles it.',
        resolvesTo: null,
        notes: null,
    },
}

/**
 * `FIELD.RENDER` — meta.json `render*` values (`renderCell`, `renderItem`, …).
 *
 * @type {Object<String, {summary: String, notes: ?String}>} keyed by constant KEY
 */
const RENDERER_CURATION = {
    CURRENCY: {
        summary: 'Number prefixed with a currency symbol, where `decimals` defaults to 2 and `symbol` to `$`.',
        notes: 'A non-numeric value renders nothing.',
    },
    DATE: {
        summary: 'Value formatted as a date.',
        notes: 'An empty value renders nothing.',
    },
    DOUBLE5: {
        summary: 'Number with exactly five decimal places, ignoring any `decimals` given.',
        notes: 'A non-numeric value renders nothing.',
    },
    FLOAT: {
        summary: 'Number with `decimals` decimal places.',
        notes: 'A non-numeric value renders nothing.',
    },
    PERCENT: {
        summary: 'Number multiplied by 100 and suffixed with a percent sign.',
        notes: 'A non-numeric value renders nothing.',
    },
    STRING: {
        summary: 'Value as plain text.',
        notes: null,
    },
    TITLE_n_INPUT: {
        summary: 'Value as text inside a row.',
        notes: 'The name is historical: there is no input in the implementation, only the value as text.',
    },
}

/**
 * `FIELD.ACTION` — names accepted by `onClick`, `onChange` and `onDone`.
 *
 * @type {Object<String, {summary: String, notes: ?String}>} keyed by constant KEY
 */
const ACTION_CURATION = {
    ADD_DATA: {
        summary: 'Validates the nested form and appends its values as a new row of the parent instance `dataKind` array.',
        notes: 'Warns and does nothing when the node has no parent instance and form.',
    },
    DOWNLOAD: {
        summary: 'Calls the host `downloadFile` API call with the file name and saves the response as a file.',
        notes: 'Does nothing when the host supplies no `downloadFile`; failures open an error popup.',
    },
    FETCH: {
        summary: 'The global `fetch`.',
        notes: null,
    },
    ON_APPLY_PERIODS: {
        summary: 'Sends all form data to the host `updateExperienceData` API call and restarts the form with the normalized response.',
        notes: 'Does nothing when the host supplies no `updateExperienceData`; failures open an error popup.',
    },
    POPUP: {
        summary: 'Opens an alert popup with the given title and content.',
        notes: null,
    },
    POPUP_OPEN: {
        summary: 'Opens the content registered by a `Popup` node with the given `id`.',
        notes: 'Event arguments are filtered out, and the row index is forwarded so fields inside the popup address the row that opened it.',
    },
    REMOVE_DATA: {
        summary: 'Removes the current row from the parent instance `dataKind` array through the parent form array mutator.',
        notes: 'Warns and does nothing when the node has no parent instance and form.',
    },
    RESET: {
        summary: 'Resets the form to its initial values.',
        notes: null,
    },
    SET_STATE: {
        summary: 'Writes the incoming value into the render instance state at the path given as the argument, for example `setState,active.tab`.',
        notes: 'This is the channel `{state.…}` templates and `showIf` read; a `Dropdown` or `Select` with a `name` and no `onChange` gets `setState,<name>` installed automatically.',
    },
    SUBMIT: {
        summary: 'Submits the form, first merging the values of every nested `dataKind` instance into the payload.',
        notes: null,
    },
    UPDATE_DATA_ON_CHANGE: {
        summary: 'Writes a changed primitive value back into the instance data at the field `name`.',
        notes: 'Marked in the source as a temporary solution; it ignores object values.',
    },
    UPLOAD: {
        summary: 'Sends the picked file together with the current form data to the host `uploadFile` API call and restarts the form with the normalized response.',
        notes: 'Does nothing when the host supplies no `uploadFile`.',
    },
    WARN: {
        summary: 'Logs the arguments with `console.warn`.',
        notes: null,
    },
}

module.exports = { VIEW_CURATION, RENDERER_CURATION, ACTION_CURATION }
