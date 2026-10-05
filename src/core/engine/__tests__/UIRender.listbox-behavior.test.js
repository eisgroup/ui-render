/**
 * SELECT / DROPDOWN BEHAVIOURAL CONTRACT ======================================
 *
 * UPGRADE-PLAN §9.5, contract-test layer (2) — the gate for §9.7-F1 Step 3, the
 * `semantic-ui-react` Dropdown replacement ("the real work", L, the cascading
 * flows named as the regression hotspot).
 *
 * WHY THIS FILE EXISTS WHEN THERE ARE ALREADY 63 Dropdown TESTS
 * -----------------------------------------------------------------------------
 * All three existing suites are coupled to `semantic-ui-react`, in two different
 * ways, and F1 Step 3 breaks both couplings:
 *
 *   - `components/__tests__/Dropdown.behavior` (21 tests) opens with
 *     `jest.mock('semantic-ui-react')` and asserts the PROPS OBJECT the wrapper
 *     hands to SUIR. That object is the seam the rewrite removes, and while it is
 *     mocked the tests cannot see anything a user does.
 *   - `components/__tests__/Dropdown` (26) and `Dropdown.more` (16) render real
 *     SUIR but reach it through its class names — `.ui.dropdown`, `.selection`,
 *     `.search`, `.disabled.dropdown` — which the rewrite is free to drop. Between
 *     them they contain exactly one interaction (a click on `.ui.dropdown` and
 *     then on an option).
 *
 * Those suites are worth keeping for what they do cover — the wrapper's massaging
 * layer: option sanitisation, case-insensitive dedup, additions, the `onChange`
 * signature. What none of them covers, and this file does, is the component driven
 * from META through the engine and observed through the accessibility tree: that
 * the list opens, what the options say, what choosing one does to the displayed
 * value, the dependent select and the submit payload.
 *
 * MARKUP-INDEPENDENT MEANS EXACTLY THAT
 * -----------------------------------------------------------------------------
 * Every handle used here is a role (`listbox`, `option`), an ARIA state
 * (`aria-expanded`, `aria-selected`, `aria-disabled`), a `tabindex`, or visible
 * text. No CSS class, no element shape. SUIR's `active`/`selected` item classes —
 * which the existing suites do read — are deliberately not used: an in-house
 * rewrite is free to drop them, and must not be free to drop the ARIA.
 *
 * The examples come from the canonical manifest wherever one exists, so "every
 * example" keeps meaning one thing; only the clauses the corpus has no example for
 * (`readonly`) use an inline meta.
 * -----------------------------------------------------------------------------
 */
import { fireEvent, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EXAMPLES } from '../../../demo/examples/manifest'
import { clearEngineGlobals, mountExample, mountMeta, noop } from '../../../demo/testing/mountExample'

const example = id => {
    const found = EXAMPLES.find(entry => entry.id === id)
    if (!found) throw new Error(`manifest has no example "${id}"`)
    return found
}

// The control is the combobox, and its options live in the listbox BESIDE it: WAI-ARIA's select-only
// combobox (see `components/Listbox.tsx`). Every helper takes the control and finds its list from it.
const controls = () => screen.queryAllByRole('combobox')
const listOf = control => control.parentElement.querySelector('[role="listbox"]')
const optionsOf = control => within(listOf(control)).queryAllByRole('option')
const optionTexts = control => optionsOf(control).map(option => option.textContent)

/** The option the control currently marks as chosen, through ARIA rather than a class. */
const ariaSelected = control => optionsOf(control)
    .filter(option => option.getAttribute('aria-selected') === 'true')
    .map(option => option.textContent)

const isExpanded = control => control.getAttribute('aria-expanded') === 'true'

/**
 * The KEYBOARD CURSOR, which since §9.7-F1 step 3 part 2 is a different thing from the selection.
 * The library committed the value as the arrows moved, so `aria-selected` was the cursor; the
 * in-house control moves a cursor and commits on Enter, and says where the cursor is the way the
 * pattern asks — `aria-activedescendant` on the control, pointing at an option's id.
 */
const cursorOf = control => {
    const id = control.getAttribute('aria-activedescendant')
    const at = id && document.getElementById(id)
    return at ? at.textContent : null
}

/**
 * What the control DISPLAYS as its current choice: its own text, now that the option list sits
 * beside it rather than inside it. When the listbox was the control, the list (mounted when
 * `mapper.tsx` passes `lazyLoad={false}` for `view: "Dropdown"`) was part of that text and had to
 * be stripped off.
 */
const displayed = control => control.textContent

/** A keystroke on the focused control, the way a user produces one: it bubbles. */
const press = (control, key, keyCode) => fireEvent.keyDown(control, { key, keyCode })

describe('Select and Dropdown behavioural contract', () => {
    let consoleError
    const originalFetch = global.fetch

    beforeEach(() => {
        consoleError = jest.spyOn(console, 'error').mockImplementation(noop)
        global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
    })

    afterEach(() => {
        clearEngineGlobals()
        consoleError.mockRestore()
        if (originalFetch === undefined) delete global.fetch
        else global.fetch = originalFetch
    })

    describe('opening, reading and choosing an option', () => {
        it('shows the bound value as text, opens on click, and lists the mapped options', () => {
            // `dropdown_meta.json`: view Dropdown, options "categories", mapOptions
            // "categoryID" — so the visible option text is each row's categoryID.
            mountExample(example('dropdown'))
            const control = screen.getByRole('combobox')

            expect(isExpanded(control)).toBe(false)
            expect(displayed(control)).toBe('Gold')

            fireEvent.click(control)

            expect(isExpanded(control)).toBe(true)
            expect(optionTexts(control)).toEqual(['Gold', 'Silver'])
            expect(ariaSelected(control)).toEqual(['Gold'])
        })

        it('moves the chosen option and the displayed text when an option is clicked', () => {
            mountExample(example('dropdown'))
            const control = screen.getByRole('combobox')
            fireEvent.click(control)

            fireEvent.click(optionsOf(control)[1])

            expect(displayed(screen.getByRole('combobox'))).toBe('Silver')
            expect(ariaSelected(screen.getByRole('combobox'))).toEqual(['Silver'])
        })

        it('resolves a stable id binding to the option label it names', () => {
            // `select-stable_meta.json` binds `selectedOption: "P"` through
            // mapOptions {text: label, value: id}, so the control must display the
            // LABEL of the row whose id is P, not the id.
            mountExample(example('selectStableValue'))
            const control = screen.getByRole('combobox')

            expect(displayed(control)).toBe('Amount')

            fireEvent.click(control)
            expect(optionTexts(control)).toEqual(['Basic', 'Standard', 'Amount'])
            expect(ariaSelected(control)).toEqual(['Amount'])

            fireEvent.click(optionsOf(control)[0])
            expect(displayed(screen.getByRole('combobox'))).toBe('Basic')
        })
    })

    describe('submit payload semantics', () => {
        /**
         * The four `select*` examples exist to demonstrate two DIFFERENT payload
         * contracts, and until now nothing drove either one from the UI.
         * `pages/main/__tests__/utils.select-form-data` unit-tests the reordering helper
         * on synthetic input, and `mapper.fields-tables-popups` asserts the index the
         * mapper computes — but no test picked an option and looked at what a host
         * would receive. That is the half F1 Step 3 can break silently.
         */

        it('moves the chosen record to the front of the bound array for an index-valued Select', () => {
            // `select-reorder-meta.json`, mapOptions.value "{index}". The selection is
            // communicated by ARRAY ORDER, not by a value: the chosen record is moved to
            // index 0 and the rest keep their source order. The example's own label says
            // so ("selected item moves to index 0 on Get Data"), and the changelog
            // records several hardenings of it, so it is a feature to protect.
            const { data } = example('selectReorder')
            const sourceOrder = data.Regions.map(region => region.RegionName)
            const { getFormData } = mountExample(example('selectReorder'))
            const payloadOrder = () => getFormData().Regions.map(region => region.RegionName)

            // `RegionSelection: "1"` in the data, so South is already at the front before
            // anyone touches the control.
            expect(sourceOrder).toEqual(['North', 'South', 'East', 'West'])
            expect(payloadOrder()).toEqual(['South', 'North', 'East', 'West'])

            const control = screen.getByRole('combobox')
            fireEvent.click(control)
            // The options keep the SOURCE order regardless of the reordered payload —
            // otherwise the list would appear to shuffle itself under the user.
            expect(optionTexts(control)).toEqual(sourceOrder)

            fireEvent.click(optionsOf(control)[2])

            expect(displayed(screen.getByRole('combobox'))).toBe('East')
            expect(payloadOrder()).toEqual(['East', 'North', 'South', 'West'])
            // The index field is not part of the payload for this contract: order is.
            expect(getFormData().RegionSelection).toBeUndefined()
        })

        it('writes the chosen option id, and leaves the array order alone, for a stable-valued Select', () => {
            // `select-stable_meta.json`, mapOptions {text: label, value: id}: the opposite
            // contract, and the one a host should prefer. Same UI gesture, different
            // payload — which is exactly why both need a behavioural gate.
            const { data } = example('selectStableValue')
            const sourceOrder = data.categories.map(category => category.label)
            const { getFormData } = mountExample(example('selectStableValue'))

            expect(getFormData().selectedOption).toBe('P')

            const control = screen.getByRole('combobox')
            fireEvent.click(control)
            fireEvent.click(optionsOf(control)[0])

            expect(getFormData().selectedOption).toBe('B')
            expect(getFormData().categories.map(category => category.label)).toEqual(sourceOrder)
        })
    })

    describe('cascading selects', () => {
        it('narrows and resets the dependent select when the parent choice changes', () => {
            // The §9.7-F1 Step 3 regression hotspot: Category -> Product, driven by
            // `rules.tsx` setState and re-read through the child's options definition.
            // Category 1 has three products, Category 2 exactly one, so the reset is
            // visible in both the option list and the displayed value.
            mountExample(example('selectCascading'))
            const [category, product] = controls()

            expect(displayed(category)).toBe('Category 1')
            expect(displayed(product)).toBe('Alpha')

            fireEvent.click(category)
            expect(optionTexts(category)).toEqual(['Category 1', 'Category 2'])
            fireEvent.click(optionsOf(category)[1])

            const [nextCategory, nextProduct] = controls()
            expect(displayed(nextCategory)).toBe('Category 2')
            expect(displayed(nextProduct)).toBe('Delta')

            fireEvent.click(nextProduct)
            expect(optionTexts(controls()[1])).toEqual(['Delta'])
        })

        it('cascades a stable string-valued select to the first option of the new parent', () => {
            mountExample(example('selectCascadingStable'))
            const [group, item] = controls()

            expect(displayed(group)).toBe('Group B')
            expect(displayed(item)).toBe('Gamma')

            fireEvent.click(group)
            expect(optionTexts(group)).toEqual(['Group A', 'Group B', 'Group C'])
            fireEvent.click(optionsOf(group)[2])

            expect(displayed(controls()[0])).toBe('Group C')
            expect(displayed(controls()[1])).toBe('Eta')

            fireEvent.click(controls()[1])
            expect(optionTexts(controls()[1])).toEqual(['Eta', 'Theta', 'Iota'])
        })
    })

    describe('keyboard operation', () => {
        it('opens with ArrowDown, wraps the cursor, and closes on the cursor with Enter', () => {
            mountExample(example('selectCascading'))
            fireEvent.focus(controls()[0])

            // ArrowDown on a closed control opens it AND advances the cursor one step,
            // so the cursor starts on the option after the current value. Unchanged by the
            // swap; what changed is that the cursor is read from `aria-activedescendant`
            // rather than from `aria-selected`, because moving no longer commits.
            press(controls()[0], 'ArrowDown', 40)
            expect(isExpanded(controls()[0])).toBe(true)
            expect(cursorOf(controls()[0])).toBe('Category 2')
            expect(ariaSelected(controls()[0])).toEqual(['Category 1'])

            // Two options, so the next step wraps back to the first.
            press(controls()[0], 'ArrowDown', 40)
            expect(cursorOf(controls()[0])).toBe('Category 1')

            press(controls()[0], 'ArrowDown', 40)
            press(controls()[0], 'Enter', 13)

            // Enter closes the list on whatever the cursor holds, through the same
            // engine path a click uses — so the dependent select cascades identically.
            expect(isExpanded(controls()[0])).toBe(false)
            expect(displayed(controls()[0])).toBe('Category 2')
            expect(displayed(controls()[1])).toBe('Delta')
        })

        /**
         * THE REWRITE IS THE RECORD, and the previous version of this test said so in advance.
         * It pinned the library's behaviour as it WAS: `selectOnNavigation` defaults to true and
         * the wrapper did not override it, so a single ArrowDown already changed the bound value
         * and cascaded the dependent select — a user who arrowed past an option had changed the
         * form and had no keyboard way back. That comment ended: "if it adopts the WAI-ARIA
         * pattern where Escape reverts, this test is the one that has to be rewritten, and the
         * rewrite is the visible record of the behaviour change."
         *
         * §9.7-F1 step 3 part 2 adopted it. Arrows move a cursor, Enter commits, and Escape
         * closes having reported nothing — so there is nothing to revert TO, which is the same
         * outcome by a cleaner route: the value the user started from was never left.
         */
        it('moves the cursor without committing, so Escape leaves the value and the cascade alone', () => {
            mountExample(example('selectCascading'))
            fireEvent.focus(controls()[0])

            press(controls()[0], 'ArrowDown', 40)
            expect(cursorOf(controls()[0])).toBe('Category 2')
            // Neither the bound value nor the dependent select has moved.
            expect(ariaSelected(controls()[0])).toEqual(['Category 1'])
            expect(displayed(controls()[0])).toBe('Category 1')
            expect(displayed(controls()[1])).toBe('Alpha')

            press(controls()[0], 'Escape', 27)

            expect(isExpanded(controls()[0])).toBe(false)
            expect(displayed(controls()[0])).toBe('Category 1')
            expect(displayed(controls()[1])).toBe('Alpha')
        })
    })

    describe('readonly', () => {
        // The manifest has no readonly Select, so this clause is expressed as meta.
        // String options are used on purpose: an inline array of {text, value}
        // objects is NOT a working meta shape (see the finding recorded with this
        // change), and this contract is about readonly, not about that.
        const readonlyMeta = {
            view: 'Row',
            items: [{
                view: 'Select',
                name: 'order.region',
                label: 'Region',
                options: { name: 'regions' },
                readonly: true,
            }],
        }
        const data = { order: { region: 'Europe' }, regions: ['Europe', 'Americas'] }

        it('marks a readonly select disabled, takes it out of the tab order, and will not open it', () => {
            mountMeta(readonlyMeta, data, { form: true, initialValues: data })
            const control = screen.getByRole('combobox')

            expect(control).toHaveAttribute('aria-disabled', 'true')
            expect(control).toHaveAttribute('tabindex', '-1')

            fireEvent.click(control)

            expect(isExpanded(screen.getByRole('combobox'))).toBe(false)
            expect(optionsOf(screen.getByRole('combobox'))).toEqual([])
        })
    })
})
