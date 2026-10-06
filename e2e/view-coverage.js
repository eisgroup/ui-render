/**
 * WHICH `view` A BROWSER TEST DRIVES — all 37 names of docs/SUPPORTED-VIEWS.md, classified.
 * =============================================================================================
 *
 * Kept total by `scripts/__tests__/view-browser-coverage.contract.test.js`: a view added to
 * `FIELD.TYPE` fails it until it is classified here, a test named here must exist in the spec it is
 * named in, and every test of `interactive-views.pw.js` must be named by some view.
 *
 * Three kinds:
 *   interactive — a user acts on it. `browser` names the tests that drive it in real Chromium. What
 *                 of it no browser test drives is said in `gap`, with the reason.
 *   passive     — it renders and takes no input of its own; `why` says so. jsdom covers every one:
 *                 the DOM snapshots of every example, and each component's own suites.
 *   alias       — another name for a view in this map (`aliasOf`), resolved to the same component.
 *
 * A browser test is worth writing where jsdom has nothing to measure: where a thing lands, what
 * paints on top, what a real pointer hits, what the cascade draws. A view whose behaviour is all
 * state and markup is covered by jsdom, and a `gap` that says so is an answer, not a debt.
 */
const t = (spec, test) => ({ spec, test })

const IV = 'interactive-views.pw.js'
const KB = 'keyboard-a11y.pw.js'

const VIEW_COVERAGE = {
    AutoSubmit: { kind: 'passive', why: 'renders no markup: it submits the form when a watched value changes, a timing contract jsdom pins with fake timers' },
    Button: {
        kind: 'interactive',
        browser: [
            t(IV, '[I] a click on the backdrop closes it, and so does Ok'),
            t('tooltip.touch.pw.js', '[I] and a tap on a real corpus node runs its action without a tooltip'),
        ],
    },
    Checkbox: {
        kind: 'interactive',
        browser: [
            t(IV, '[I] the Expand All checkbox in a table header opens every row, and closes them again'),
            t(IV, '[I] with the same table twice in a document, the label inside the popup checks its own box'),
        ],
    },
    Col: { kind: 'passive', why: 'a flex container' },
    ColList: { kind: 'alias', aliasOf: 'List' },
    Column: { kind: 'alias', aliasOf: 'Col' },
    Counter: { kind: 'passive', why: 'a number that animates on mount' },
    Data: { kind: 'passive', why: 'a nested document: what a user acts on in it are its own views, each classified under its own name' },
    Dropdown: {
        kind: 'interactive',
        browser: [
            t(KB, '[I] the combobox is reachable by Tab and opens from the keyboard'),
            t(KB, '[I] the open combobox names its cursor with `aria-activedescendant`'),
            t(IV, '[I] a click on an option selects it and closes the list; a click outside closes it and keeps the value'),
        ],
    },
    Expand: {
        kind: 'interactive',
        browser: [
            t(KB, '[I] an Expand title is a button in the tab order that Enter toggles'),
            t(IV, '[I] a sortable header cycles descending, ascending, unsorted, and the rows follow'),
        ],
    },
    ExpandList: {
        kind: 'interactive',
        browser: [t(KB, '[I] an Expand title is a button in the tab order that Enter toggles')],
    },
    HorizontalLayout: { kind: 'alias', aliasOf: 'Row' },
    HorizontalList: { kind: 'alias', aliasOf: 'RowList' },
    Icon: { kind: 'passive', why: 'a glyph from the icon font' },
    Image: { kind: 'passive', why: 'an `<img>`' },
    Input: {
        kind: 'interactive',
        browser: [
            t(IV, '[I] a click opens the calendar under the input, inside the viewport, and it paints'),
            t(IV, '[I] with no room below the input it opens above, still inside the viewport'),
            t(IV, '[I] a click on a day writes it in the display format and closes the calendar'),
            t(IV, '[I] a click outside closes the calendar and leaves the value alone'),
            t(IV, '[I] a date field inside it opens its calendar above it, where a click picks a day'),
        ],
        gap: 'text and number inputs: native controls with nothing positioned or layered; typing, formatting and validation are state, and jsdom covers them',
    },
    Label: { kind: 'passive', why: 'a `<label>`; activating its control is the browser\'s own behaviour' },
    List: { kind: 'passive', why: 'renders the node data through `renderItem`' },
    PieChart: { kind: 'passive', why: 'an inline SVG drawn from the node data' },
    Popup: {
        kind: 'interactive',
        browser: [
            t(IV, '[I] the backdrop covers the viewport, and the box paints above it'),
            t(IV, '[I] a click on the backdrop closes it, and so does Ok'),
            t(IV, '[I] the keyboard: a dialog that takes focus and keeps it, Escape closes it, and focus goes back to the trigger'),
            t(IV, '[I] a date field inside it opens its calendar above it, where a click picks a day'),
        ],
    },
    ProgressSteps: {
        kind: 'interactive',
        browser: [t(IV, '[I] a click on a step makes it current, shows its content, and fills the bars up to it')],
    },
    Row: { kind: 'passive', why: 'a flex container' },
    RowList: { kind: 'passive', why: 'renders the node data through `renderItem`, in a row' },
    Select: {
        kind: 'interactive',
        browser: [t(KB, '[R] ...but a `view: "Select"` mounts none of them until it opens')],
        gap: 'choosing an option: the listbox is the one `Dropdown` renders, which the dropdown tests drive by keyboard and by pointer',
    },
    SliderLabel: {
        kind: 'interactive',
        browser: [
            t(IV, '[I] dragging the handle carries it with the pointer, and the value is the position'),
            t(IV, '[I] the keys step the value, and the handle moves by that share of the track'),
            t('harness.tooltip.pw.js', '[I] the five snapshot-gated `slider` bubbles are painted and sit above their handles'),
        ],
    },
    Space: { kind: 'passive', why: 'an empty spacer' },
    Table: {
        kind: 'interactive',
        browser: [
            t(IV, '[I] a sortable header cycles descending, ascending, unsorted, and the rows follow'),
            t(IV, '[I] the pager marks the page it is on, and each page holds its own rows'),
        ],
        gap: 'the inline draft row (`LocalDraftTableRow`): its fields are inputs, and adding the row is form state, which jsdom covers',
    },
    TableCells: { kind: 'passive', why: 'table cells for its items' },
    TabList: {
        kind: 'interactive',
        browser: [],
        gap: 'renders the engine `Tabs` the `tabs` test drives, with the tabs taken from data: the keyboard and the focus ring are the same component\'s',
    },
    Tabs: {
        kind: 'interactive',
        browser: [t(KB, '[I] a tab bar is a tablist; an arrow moves focus to the next tab, selects it, and the focus ring paints')],
    },
    Text: { kind: 'passive', why: 'text' },
    Title: { kind: 'passive', why: 'a heading' },
    Toggle: {
        kind: 'interactive',
        browser: [t(IV, '[I] a click on the switch flips it and repaints it, and keyboard focus draws its ring')],
    },
    Tooltip: {
        kind: 'interactive',
        browser: [
            t('corpus.tooltip.pw.js', '[I] both declarations in the `Factors` tab render their own text'),
            t('corpus.tooltip.pw.js', '[I] the deep site places its bubble just as closely, and raises nothing'),
            t('corpus.tooltip.pw.js', '[I] hover opens after our 500 ms delay, not semantic-ui-react\'s 50 ms'),
        ],
    },
    Upload: {
        kind: 'interactive',
        browser: [t(KB, '[I] an upload drop zone is a button that Space opens, and keyboard focus shows the formats it takes')],
    },
    VerticalLayout: { kind: 'alias', aliasOf: 'Col' },
    VerticalList: { kind: 'alias', aliasOf: 'List' },
}

module.exports = { VIEW_COVERAGE }
