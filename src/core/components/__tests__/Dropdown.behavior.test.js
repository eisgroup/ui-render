/**
 * THE WRAPPER'S MASSAGING LAYER, asserted at the seam — AND THIS FILE IS NOT A GATE.
 * =============================================================================================
 *
 * It mocks `semantic-ui-react` to `() => null` and reads the props object the wrapper hands down.
 * Measured, on the unmodified repo: every test here passes against an inner control that RENDERS
 * NOTHING. That is not a flaw to fix by deleting the file — the option sanitiser, the
 * case-insensitive addition dedup, the value normalisation and the callback signatures are real
 * wrapper logic that §9.7-F1 step 3 KEEPS, and the props object is the cheapest honest place to
 * observe them. It is a flaw to MISTAKE for a gate.
 *
 * What gates the component is `Dropdown.gate.test.js`, which drives the real library through
 * roles, text and callbacks — and whose acceptance test is that all of it fails when the inner
 * control is stubbed to render nothing. Anything observable by a user belongs there, not here.
 *
 * The seam this file reads is the one the swap deletes, so when the replacement lands every
 * assertion here has to be re-aimed at whatever the wrapper hands its own inner control. Keep
 * the assertions; expect to rewrite how they reach them.
 */
import React from 'react'
import { act, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Dropdown as SemanticDropdown } from 'semantic-ui-react'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { Dropdown } from '../Dropdown'

jest.mock('semantic-ui-react', () => ({
    Dropdown: jest.fn(() => null),
}))

const objectOptions = [
    { text: 'Option A', value: 'a' },
    { text: 'Option B', value: 'b' },
]

const withConfig = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const latestSemanticProps = () => {
    const calls = SemanticDropdown.mock.calls
    return calls[calls.length - 1][0]
}

const renderDropdown = props => render(withConfig(<Dropdown {...props} />))

describe('Dropdown parent value and option contracts', () => {
    beforeEach(() => {
        SemanticDropdown.mockClear()
    })

    it('keeps numeric zero when the controlled parent value changes', () => {
        const { rerender } = renderDropdown({
            options: [{ text: 'Zero', value: 0 }, { text: 'One', value: 1 }],
            value: 1,
        })

        act(() => {
            rerender(withConfig(
                <Dropdown
                    options={[{ text: 'Zero', value: 0 }, { text: 'One', value: 1 }]}
                    value={0}
                />
            ))
        })

        expect(latestSemanticProps().value).toBe(0)
    })

    it('uses option text as the cascading fallback when an option has no value', () => {
        const onChange = jest.fn()
        const { rerender } = renderDropdown({
            options: objectOptions,
            value: 'b',
            onChange,
        })
        onChange.mockClear()

        act(() => {
            rerender(withConfig(
                <Dropdown
                    options={[{ text: 'Fallback label', value: null }]}
                    value="b"
                    onChange={onChange}
                />
            ))
        })

        // `name` is not passed in this case, so it arrives as `undefined` — asserted explicitly
        // rather than omitted, because `toHaveBeenCalledWith` checks ARITY: the reset gained the
        // `(value, name, event)` signature at §9.7-F1 step 3 part 1, where it used to call with
        // one stringified argument.
        expect(onChange).toHaveBeenCalledWith('Fallback label', undefined)
    })

    /**
     * TWO CASCADING-RESET DEFECTS, both found by the §9.7-F1 step 3 part 1 audit and both about
     * what the HOST is told rather than what is displayed — which is why 74 dropdown tests and the
     * whole corpus were green over them.
     */
    it('resets to the option\'s OWN value, not a stringified copy of it', () => {
        const calls = []
        // A plain function, not `jest.fn()`: the house rule is that `isFunction()` rejects
        // cross-realm functions, and keeping to plain functions here means the assertion reads the
        // same whether or not the product ever guards the callback.
        const onChange = (...args) => calls.push(args)
        const { rerender } = render(withConfig(
            <Dropdown options={[{ text: 'A', value: 1 }, { text: 'B', value: 2 }]} value={2}
                      name="region" onChange={onChange}/>
        ))

        act(() => {
            rerender(withConfig(
                <Dropdown options={[{ text: 'C', value: 7 }, { text: 'D', value: 8 }]} value={2}
                          name="region" onChange={onChange}/>
            ))
        })

        // `7`, the number the option carries — not `'7'`. A host matching option values with
        // `===` missed the reset entirely before this.
        expect(calls).toEqual([[7, 'region']])
    })

    it('does not invent a selection for a `multiple` dropdown mounted with an empty array', () => {
        const calls = []
        const onChange = (...args) => calls.push(args)

        render(withConfig(
            <Dropdown multiple options={[{ text: 'A', value: 'a' }, { text: 'B', value: 'b' }]}
                      value={[]} name="region" onChange={onChange}/>
        ))

        // `String([])` is `''`, which is in no option list, so the reset guard used to fire and
        // report a selection of the first option before the user had touched anything.
        expect(calls).toEqual([])
    })

    it('appends `optionsLabel` once, however many options are added', () => {
        render(withConfig(
            <Dropdown allowAdditions search optionsLabel="FOOTER" name="region"
                      options={[{ text: 'Option A', value: 'a' }]} onChange={() => {}}/>
        ))

        // NO manual rerender in between, and that is not a shortcut: passing a fresh `options`
        // array would change its identity, and the wrapper's sync effect
        // (`!isEqual(options, opts) && setOptions(opts)`) would then wipe the addition — and the
        // duplicate label with it, so the test would pass against the defect. The `setOptions`
        // inside `onAddItem` re-renders on its own, which is all this needs.
        act(() => { latestSemanticProps().onAddItem({}, { value: 'Zed' }) })
        act(() => { latestSemanticProps().onAddItem({}, { value: 'Yan' }) })

        // `onAddItem` writes the option list back into state, and it used to write back the copy
        // that ALREADY carried the label — so each addition appended another one.
        const options = latestSemanticProps().options
        expect(options.filter(o => o.content === 'FOOTER')).toHaveLength(1)
        expect(options.map(o => o.text)).toEqual(['Yan', 'Zed', 'Option A', ''])
    })

    it('gives the help text its own id and points the control at it', () => {
        const { container } = render(withConfig(
            <Dropdown id="region" error="Required" name="region"
                      options={[{ text: 'A', value: 'a' }]} onChange={() => {}}/>
        ))

        // Note this suite MOCKS semantic-ui-react, so the listbox is not in the document at all —
        // which is why the "only one element carries the id" half of this contract lives in
        // `Dropdown.test.js` against the real one. Here: the derived id, and the wiring.
        expect(container.querySelector('.field-help').id).toBe('region-help')
        expect(latestSemanticProps()['aria-describedby']).toBe('region-help')
    })

    it('adds no `aria-describedby` when there is no help text to point at', () => {
        render(withConfig(
            <Dropdown id="region" name="region" options={[{ text: 'A', value: 'a' }]} onChange={() => {}}/>
        ))

        expect(latestSemanticProps()['aria-describedby']).toBeUndefined()
    })

    // The sanitizer dispatches on `typeof options[0].value`, and `typeof null === 'object'` — so a null value
    // took the "value is an array" branch and became the string "null", which is not what the cascading-reset
    // effect above emits for that same option. The two paths have to agree on a valueless option or it can
    // never be selected.
    it('gives a null-valued option its text as the value, matching the cascading fallback', () => {
        renderDropdown({ options: [{ text: 'Fallback label', value: null }] })

        expect(latestSemanticProps().options).toEqual([
            expect.objectContaining({ text: 'Fallback label', value: 'Fallback label' }),
        ])
    })

    it('treats an option with no value key the same way', () => {
        renderDropdown({ options: [{ text: 'No value here' }] })

        expect(latestSemanticProps().options).toEqual([
            expect.objectContaining({ text: 'No value here', value: 'No value here' }),
        ])
    })

    // The branch is chosen from options[0] but applied to every option, so the text fallback has to be
    // per-option: a later option that does carry a value must keep it.
    it('keeps real values on later options when the first one has none', () => {
        renderDropdown({ options: [{ text: 'No value' }, { text: 'Has value', value: 'x' }] })

        expect(latestSemanticProps().options).toEqual([
            expect.objectContaining({ text: 'No value', value: 'No value' }),
            expect.objectContaining({ text: 'Has value', value: 'x' }),
        ])
    })

    // The engine hands every view `currencyCode` and `onDataChanged`. Semantic's Dropdown spreads
    // whatever it does not recognise onto its <div>, so these reached the DOM and React warned on the
    // demo's Dropdown example. Assert at the leak boundary: what we hand to Semantic.
    it('keeps engine-only props out of the props handed to Semantic', () => {
        renderDropdown({
            options: objectOptions,
            currencyCode: 'EUR',
            onDataChanged: () => {},
            view: 'Dropdown',
            index: '2',
            symbol: '$',
            _comment: 'a note to the next meta author',
        })

        const semanticProps = latestSemanticProps()
        expect(semanticProps).not.toHaveProperty('currencyCode')
        expect(semanticProps).not.toHaveProperty('onDataChanged')
        expect(semanticProps).not.toHaveProperty('view')
        expect(semanticProps).not.toHaveProperty('index')
        expect(semanticProps).not.toHaveProperty('symbol')
        expect(semanticProps).not.toHaveProperty('_comment')
        // The options still arrive, so nothing else was stripped by accident.
        expect(semanticProps.options).toHaveLength(2)
    })

    // Semantic declares no `name` prop, so it spread ours onto its <div role="listbox"> — 17
    // occurrences in the DOM baseline. It is still the value every Dropdown callback reports as its
    // second argument (covered by the onChange/onSelect/onSearch tests in this file), so this must
    // hold *without* the prop reaching Semantic. `label` is consumed by the wrapper's own <Text>.
    it('keeps `name` and `label` out of the props handed to Semantic, and still reports the name', () => {
        const onChange = jest.fn()
        renderDropdown({ options: objectOptions, name: 'category', label: 'Category', onChange })

        const semanticProps = latestSemanticProps()
        expect(semanticProps).not.toHaveProperty('name')
        expect(semanticProps).not.toHaveProperty('label')

        semanticProps.onChange({}, { value: 'b' })
        expect(onChange).toHaveBeenCalledWith('b', 'category', {})
    })

    it('still stringifies a genuinely object-valued option', () => {
        renderDropdown({ options: [{ text: 'Colour', value: [1, -1] }] })

        expect(latestSemanticProps().options).toEqual([
            expect.objectContaining({ text: 'Colour', value: '1,-1' }),
        ])
    })

    it('reports the fallback value when a null-valued option is selected', () => {
        const onChange = jest.fn()
        renderDropdown({ options: [{ text: 'Fallback label', value: null }], onChange })

        const { onChange: semanticOnChange, options } = latestSemanticProps()
        act(() => {
            semanticOnChange({}, { value: options[0].value })
        })

        expect(onChange).toHaveBeenCalledWith('Fallback label', undefined, expect.anything())
    })

    it('preserves explicit selection and autofocus configuration', () => {
        renderDropdown({
            options: objectOptions,
            selection: false,
            autofocus: true,
        })

        expect(latestSemanticProps()).toEqual(expect.objectContaining({
            selection: false,
            searchInput: { autoFocus: true },
        }))
    })

    it('leaves object options with numeric values intact', () => {
        const options = [{ text: 'Ten', value: 10 }]
        renderDropdown({ options })

        expect(latestSemanticProps().options).toEqual(options)
    })

    it('normalizes color-array values to the string values used by options', () => {
        renderDropdown({
            options: [{ text: 'Red', value: [255, 0, 0] }],
            value: [255, 0, 0],
        })

        expect(latestSemanticProps().options[0].value).toBe('255,0,0')
        expect(latestSemanticProps().value).toBe('255,0,0')
    })

    it('normalizes every selected color-array value in multiple mode', () => {
        renderDropdown({
            options: [
                { text: 'Red', value: [255, 0, 0] },
                { text: 'Green', value: [0, 255, 0] },
            ],
            value: [[255, 0, 0], [0, 255, 0]],
            multiple: true,
        })

        expect(latestSemanticProps().value).toEqual(['255,0,0', '0,255,0'])
        expect(latestSemanticProps().noResultsMessage).toBe('No options left')
    })
})

describe('Dropdown interaction callback contracts', () => {
    beforeEach(() => {
        SemanticDropdown.mockClear()
    })

    it('maps a case-insensitive label back to its stable single-select value', () => {
        const onChange = jest.fn()
        const event = { type: 'change' }
        renderDropdown({
            options: [{ text: 'United States', value: 'US' }],
            name: 'country',
            onChange,
        })

        act(() => {
            latestSemanticProps().onChange(event, { value: '  united states  ' })
        })

        expect(onChange).toHaveBeenCalledWith('US', 'country', event)
        expect(latestSemanticProps().value).toBe('US')
    })

    it('deduplicates a multiple selection while keeping the latest choice last', () => {
        const onChange = jest.fn()
        const event = { type: 'change' }
        renderDropdown({
            options: [
                { text: 'United States', value: 'US' },
                { text: 'Canada', value: 'CA' },
            ],
            name: 'countries',
            multiple: true,
            onChange,
        })

        act(() => {
            latestSemanticProps().onChange(event, {
                value: ['US', 'CA', ' united states '],
            })
        })

        expect(onChange).toHaveBeenCalledWith(['CA', 'US'], 'countries', event)
        expect(latestSemanticProps().value).toEqual(['CA', 'US'])
    })

    it('passes numeric values through without string duplicate processing', () => {
        const onChange = jest.fn()
        const event = { type: 'change' }
        renderDropdown({ options: [0, 1], name: 'rank', onChange })

        act(() => {
            latestSemanticProps().onChange(event, { value: 0 })
        })

        expect(onChange).toHaveBeenCalledWith(0, 'rank', event)
    })

    it('keeps the selected value available to onSelect after the change rerender', () => {
        const onChange = jest.fn()
        const onSelect = jest.fn()
        const changeEvent = { type: 'change' }
        const closeEvent = { type: 'close' }
        renderDropdown({
            options: objectOptions,
            name: 'option',
            onChange,
            onSelect,
        })

        act(() => {
            latestSemanticProps().onChange(changeEvent, { value: 'b' })
        })
        act(() => {
            latestSemanticProps().onClose(closeEvent)
        })

        expect(onSelect).toHaveBeenCalledWith('b', 'option', closeEvent)
    })

    it('forwards search text, field name, and the originating event', () => {
        const onSearch = jest.fn()
        const event = { type: 'search' }
        renderDropdown({ options: objectOptions, name: 'option', onSearch, search: true })

        act(() => {
            latestSemanticProps().onSearchChange(event, { searchQuery: 'needle' })
        })

        expect(onSearch).toHaveBeenCalledWith('needle', 'option', event)
    })
})

describe('Dropdown additions contracts', () => {
    beforeEach(() => {
        SemanticDropdown.mockClear()
    })

    it('trims and prepends a new option before notifying the caller', () => {
        const onAddItem = jest.fn()
        const event = { type: 'addition' }
        renderDropdown({
            options: objectOptions,
            name: 'option',
            allowAdditions: true,
            onAddItem,
        })

        act(() => {
            latestSemanticProps().onAddItem(event, { value: '  Option C  ' })
        })

        expect(onAddItem).toHaveBeenCalledWith('Option C', 'option', event)
        expect(latestSemanticProps().options[0]).toEqual({
            text: 'Option C',
            value: 'Option C',
        })
    })

    it('updates the casing of a duplicate free-text option without adding it again', () => {
        const onAddItem = jest.fn()
        renderDropdown({
            options: [{ text: 'Alpha', value: 'alpha' }],
            allowAdditions: true,
            onAddItem,
        })
        const propsAtAddition = latestSemanticProps()

        act(() => {
            propsAtAddition.onAddItem({ type: 'addition' }, { value: 'ALPHA' })
        })

        expect(propsAtAddition.options).toEqual([{ text: 'ALPHA', value: 'ALPHA' }])
        expect(onAddItem).not.toHaveBeenCalled()
    })

    it('does not replace a stable id when an added label duplicates existing text', () => {
        const onAddItem = jest.fn()
        renderDropdown({
            options: [{ text: 'Alpha', value: 'alpha-id' }],
            allowAdditions: true,
            onAddItem,
        })
        const propsAtAddition = latestSemanticProps()

        act(() => {
            propsAtAddition.onAddItem({ type: 'addition' }, { value: 'ALPHA' })
        })

        expect(propsAtAddition.options).toEqual([{ text: 'Alpha', value: 'alpha-id' }])
        expect(onAddItem).not.toHaveBeenCalled()
    })

    it('preserves explicit addition labels and upward positioning', () => {
        renderDropdown({
            options: objectOptions,
            allowAdditions: true,
            additionLabel: 'Create ',
            additionPosition: 'top',
            upward: true,
        })

        expect(latestSemanticProps()).toEqual(expect.objectContaining({
            additionLabel: 'Create ',
            additionPosition: 'top',
            upward: true,
        }))
    })
})
