/**
 * MANIFEST-WIDE BEHAVIOURAL CONTRACT ==========================================
 *
 * UPGRADE-PLAN §9.5, contract-test layer (2), the corpus-wide floor. Layer (1)
 * (`examples.dom-contract.test.js`) pins the rendered bytes of all 38 examples and
 * gates the *pure* refactors. This file pins what those bytes MEAN — the roles a
 * screen reader and a keyboard see, and the values the form holds — and gates
 * §9.7-F1, where `Table`, `TooltipPop` and `Dropdown` are reimplemented in-house,
 * the DOM changes by design, and the layer-(1) snapshots are regenerated and can
 * therefore no longer be the guard.
 *
 * WHY A CENSUS AND NOT A SNAPSHOT
 * -----------------------------------------------------------------------------
 * The pinned values below are literals in this file, not a `.snap`. That is the
 * point: `jest -u` must not be able to bless a change here. A diff in this file is
 * a diff in the accessibility contract, and it has to be typed out by hand and
 * read in review. When F1 lands, exactly the entries F1 is expected to move (see
 * the note on `alert` and `option`) should move, and nothing else.
 *
 * WHAT THESE ASSERTIONS DELIBERATELY DO NOT TOUCH
 * -----------------------------------------------------------------------------
 * No CSS class, no `querySelector`, no element nesting, no attribute other than
 * the form-binding `name`. Ask of every line here: "would this still pass if the
 * component were rewritten from scratch with the same behaviour?" A line that
 * would not belongs in layer (1).
 *
 * NOT DUPLICATED HERE (already covered behaviourally elsewhere)
 * -----------------------------------------------------------------------------
 *   - mounting every example without a caught render error or an unexpected
 *     console warning — `demo/pages/__tests__/Examples.registry-and-rendering`;
 *   - edit -> submit payload, `showIf` re-evaluation, validation surfacing,
 *     data-prop reinitialisation — `pages/main/__tests__/UIRender.form-flows`;
 *   - `addData`/`removeData` row operations — `pages/main/__tests__/rules.actions`
 *     and `demo/pages/__tests__/NestedDataKind.interactions`.
 * -----------------------------------------------------------------------------
 */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { get, isEqual } from '../../../core/utils/object'
import { clearEngineGlobals, mountExample, noop } from '../../testing/mountExample'
import { EXAMPLES } from '../manifest'

/**
 * Every ARIA/HTML-semantic role the corpus is inspected for. A role absent from an
 * example is absent from its census entry rather than recorded as 0, so the
 * entries stay readable AND total: a role that appears where it did not before
 * adds a key and fails the comparison just as loudly as one that disappears.
 */
const CENSUS_ROLES = [
    'table', 'rowgroup', 'row', 'columnheader', 'cell',
    'button', 'link', 'navigation', 'heading', 'list', 'listitem', 'separator',
    'textbox', 'spinbutton', 'checkbox', 'radio', 'slider',
    'combobox', 'listbox', 'option', 'menu', 'menuitem',
    'progressbar', 'img', 'alert', 'dialog', 'tooltip', 'tab', 'tablist',
]

/**
 * THE ACCESSIBILITY CENSUS OF THE EXAMPLE CORPUS
 * -----------------------------------------------------------------------------
 * Measured at mount, in the closed/initial state. Read this as "what the example
 * promises to assistive technology", and treat a diff as a consumer-visible
 * change.
 *
 * TWO GROUPS OF ENTRIES F1 IS EXPECTED TO MOVE, AND ONLY THESE TWO:
 *
 *   `alert` — every count here is a `semantic-ui-react` Dropdown artefact: SUIR
 *     renders the trigger's selected-value text with `role="alert" aria-live`
 *     (`Dropdown.js` renderText), so each rendered dropdown contributes exactly
 *     one. Announcing the current value as an alert is a defect, not a contract:
 *     the F1 Step 3 replacement should emit NO `alert`, and every `alert` entry
 *     below should go to zero in that commit. It is counted rather than filtered
 *     out so that the removal is a visible, reviewed line in the diff.
 *
 *   `option` — present only where the option list is in the DOM while closed.
 *     `mapper.js` passes `lazyLoad={false}` for `view: "Dropdown"` and leaves the
 *     wrapper default (`true`) for `view: "Select"`, which is why `dropdown` and
 *     `layout` carry options at mount and `selectStableValue` does not. If the
 *     replacement changes when options are mounted, these entries move.
 *
 * Everything else is the durable part: an example with a `Table` must still expose
 * `table`/`rowgroup`/`row`/`columnheader`/`cell`, and a `Select`/`Dropdown` must
 * still expose a `listbox` (or, if the rewrite adopts the WAI-ARIA combobox
 * pattern, `combobox` — a deliberate, reviewable change of this literal).
 *
 * Examples with an EMPTY entry are a finding, not an oversight: `expandList`,
 * `tabs`, `tabsButtoned`, `upload` and `uploadVariants` render no interactive role
 * at all, so their controls are invisible to assistive technology and unreachable
 * by keyboard. That is why layer (2) cannot express a keyboard contract for tabs
 * or upload — there is nothing role-shaped to drive — and why §9.5's mandatory
 * Playwright/a11y suite, not this file, is the gate for them. `showIf` and
 * `summaryBox` are legitimately text-only.
 */
const ROLE_CENSUS = {
    dropdown: { listbox: 1, option: 2, alert: 1 },
    dropdownExperience: { table: 1, rowgroup: 2, row: 3, columnheader: 3, cell: 9, listbox: 2, option: 5, alert: 2 },
    selectIndexValue: { listbox: 1, alert: 1 },
    selectStableValue: { listbox: 1, alert: 1 },
    selectCascading: { table: 1, rowgroup: 2, row: 3, columnheader: 3, cell: 9, listbox: 2, alert: 2 },
    selectCascadingStable: { table: 1, rowgroup: 2, row: 3, columnheader: 3, cell: 12, listbox: 2, alert: 2 },
    selectReorder: { table: 1, rowgroup: 2, row: 5, columnheader: 3, cell: 12, listbox: 1, alert: 1 },
    buttonIcon: { button: 1 },
    buttonDownload: { button: 1 },
    input: { textbox: 1 },
    inputIntegerMin0: { textbox: 2 },
    inputToggle: { checkbox: 2 },
    decimal: { table: 1, rowgroup: 2, row: 3, columnheader: 1, cell: 2 },
    layout: { listbox: 1, option: 2, alert: 1 },
    list: { textbox: 2 },
    expandList: {},
    tabList: { textbox: 1 },
    tabs: {},
    tabsButtoned: {},
    tableNested: { table: 1, rowgroup: 2, row: 3, columnheader: 6, cell: 12, checkbox: 1 },
    tableVertical: { table: 1, rowgroup: 2, row: 6, columnheader: 6, cell: 12, checkbox: 1 },
    tableExtraItems: { table: 1, rowgroup: 2, row: 2, columnheader: 3, cell: 3, textbox: 1 },
    tableMatrix: { table: 1, rowgroup: 2, row: 5, columnheader: 12, cell: 14 },
    tableMatrixRequired: { table: 1, rowgroup: 2, row: 4, columnheader: 10, cell: 14 },
    tableForm: { table: 1, rowgroup: 2, row: 5, columnheader: 4, cell: 9, button: 4, textbox: 6 },
    nestedDataKind: { table: 4, rowgroup: 8, row: 20, columnheader: 18, cell: 58, button: 13, textbox: 38, spinbutton: 6 },
    tablePagination: { table: 1, rowgroup: 2, row: 6, columnheader: 5, cell: 25, button: 7, navigation: 1 },
    pieChart: { img: 2 },
    popupContent: { table: 1, rowgroup: 2, row: 3, columnheader: 6, cell: 12, button: 1, checkbox: 1 },
    ratingDetails: { table: 1, rowgroup: 2, row: 6, columnheader: 3, cell: 15, listbox: 1, option: 2, alert: 1 },
    rowListRelativeData: { table: 1, rowgroup: 2, row: 5, columnheader: 5, cell: 10, listbox: 1, option: 2, alert: 1 },
    showIf: {},
    summaryBox: {},
    upload: {},
    uploadVariants: {},
    slider: { slider: 6 },
    invalidArray: { table: 2, rowgroup: 4, row: 2, columnheader: 9, listbox: 1, img: 1, alert: 1 },
    all: { table: 3, rowgroup: 6, row: 10, columnheader: 18, cell: 31, button: 4, checkbox: 1, listbox: 3, option: 4, img: 2, alert: 3 },
}

/**
 * NAME -> FORM VALUE BINDING, PER EXAMPLE
 * -----------------------------------------------------------------------------
 * `bound` is how many form controls the example renders with a `name` (the meta's
 * data binding, and the only attribute this file reads — it is the contract, not
 * markup: any rewrite must still render a control bound to that path). `resolved`
 * is how many of those names actually address a value in the example's data.
 *
 * Examples absent from this map render no bound control at all. Two entries have
 * `resolved: 0` by design and are not defects: `input` binds
 * `categories.0.annualAmount`, a key `example_data.json` does not carry, and
 * `tableExtraItems` binds under `no_data_exists.` on purpose.
 */
const FORM_BINDINGS = {
    input: { bound: 1, resolved: 0 },
    inputIntegerMin0: { bound: 2, resolved: 2 },
    list: { bound: 2, resolved: 2 },
    tabList: { bound: 1, resolved: 1 },
    tableExtraItems: { bound: 1, resolved: 0 },
    tableForm: { bound: 6, resolved: 4 },
    nestedDataKind: { bound: 36, resolved: 30 },
}

/**
 * CONTROLS WITH NO ACCESSIBLE NAME — a counted ledger, in the spirit of layer
 * (1)'s KNOWN_DOM_DEFECTS. 82 of the corpus's 117 interactive controls compute an
 * EMPTY accessible name, so most of what the corpus renders is unusable with a
 * screen reader. Pinned as one aggregate rather than per example because the
 * number is the signal: it may only fall (each fall is a fix worth recording), and
 * a rise means a new nameless control just shipped. Per-view detail belongs in
 * §9.5's mandatory Playwright/a11y suite.
 */
const NAMELESS_CONTROLS = { total: 117, nameless: 82 }

/** Roles that count as an interactive control for the ledger above. */
const CONTROL_ROLES = ['textbox', 'spinbutton', 'checkbox', 'combobox', 'listbox', 'slider', 'button']

const censusOf = () => CENSUS_ROLES.reduce((census, role) => {
    const count = screen.queryAllByRole(role, { hidden: true }).length
    if (count) census[role] = count
    return census
}, {})

/** @returns {Array<String>} de-duplicated `name` bindings of every rendered form control */
const boundNames = () => [...new Set(
    [
        ...screen.queryAllByRole('textbox', { hidden: true }),
        ...screen.queryAllByRole('spinbutton', { hidden: true }),
        ...screen.queryAllByRole('checkbox', { hidden: true }),
    ]
        .map(control => control.getAttribute('name'))
        .filter(Boolean)
)]

describe('demo example behavioural contract', () => {
    let consoleError
    const originalFetch = global.fetch

    beforeEach(() => {
        // Warnings are asserted by Examples.registry-and-rendering.test.js; silencing
        // them here keeps a census diff readable.
        consoleError = jest.spyOn(console, 'error').mockImplementation(noop)
        global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
    })

    afterEach(() => {
        clearEngineGlobals()
        consoleError.mockRestore()
        if (originalFetch === undefined) delete global.fetch
        else global.fetch = originalFetch
    })

    it('pins the census against exactly the manifest, with no stale or missing entry', () => {
        expect(Object.keys(ROLE_CENSUS).sort()).toEqual(EXAMPLES.map(({ id }) => id).sort())
    })

    test.each(EXAMPLES.map(example => [example.id, example]))(
        '%s exposes its pinned set of accessible roles',
        (id, example) => {
            const { unmount } = mountExample(example)
            const census = censusOf()
            unmount()

            expect(census).toEqual(ROLE_CENSUS[id])
        }
    )

    test.each(EXAMPLES.map(example => [example.id, example]))(
        '%s round-trips every bound name from its data into the submit payload',
        (id, example) => {
            const { unmount, getFormData } = mountExample(example)
            const names = boundNames()
            const formData = getFormData()

            const mismatched = []
            let resolved = 0
            for (const name of names) {
                const expected = get(example.data, name)
                // A name the data does not address is a binding this example never
                // claimed to fill (a draft row's field, a deliberately absent path).
                if (expected === undefined) continue
                resolved++
                const actual = get(formData, name)
                if (!isEqual(actual, expected)) {
                    mismatched.push(`${name}: form=${JSON.stringify(actual)} data=${JSON.stringify(expected)}`)
                }
            }
            unmount()

            // Every value the meta binds by `name` must reach the field at that path
            // and come back out of the form unchanged. Formatting is deliberately not
            // in scope: `tableForm` renders 2022-01-01 as 01-01-2022, and it is the
            // *payload* that must keep the ISO value, not the display.
            expect(mismatched).toEqual([])
            expect(FORM_BINDINGS[id] || { bound: 0, resolved: 0 })
                .toEqual({ bound: names.length, resolved })
        }
    )

    it('holds the ledger of interactive controls with no accessible name', () => {
        let total = 0
        let nameless = 0

        for (const example of EXAMPLES) {
            const { unmount } = mountExample(example)
            for (const role of CONTROL_ROLES) {
                const all = screen.queryAllByRole(role, { hidden: true }).length
                // The `name` option runs dom-testing-library's accessible-name
                // computation (label/aria-label/aria-labelledby/content), so this is the
                // same name assistive technology would announce.
                const named = screen.queryAllByRole(role, { hidden: true, name: /\S/ }).length
                total += all
                nameless += all - named
            }
            unmount()
            clearEngineGlobals()
        }

        expect({ total, nameless }).toEqual(NAMELESS_CONTROLS)
    })
})
