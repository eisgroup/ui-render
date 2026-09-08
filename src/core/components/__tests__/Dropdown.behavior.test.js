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
 * THAT RE-AIMING HAS HAPPENED. This file used to mock `semantic-ui-react`; step 3 part 2 replaced
 * that seam with the in-house `Listbox`, and the mock moved with it. Not one assertion changed —
 * they were always about what the WRAPPER computes, which is what the swap kept.
 */
import React from 'react'
import { act, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import Listbox from '../Listbox'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { Dropdown } from '../Dropdown'

// RE-AIMED at §9.7-F1 step 3 part 2, exactly as this file's header said it would have to be: the
// seam it reads is no longer `semantic-ui-react`'s `Dropdown` but the in-house `Listbox` the
// wrapper now renders. The assertions did not change — they were always about what the WRAPPER
// computes and hands down, which is the massaging layer the swap keeps.
jest.mock('../Listbox', () => ({ __esModule: true, default: jest.fn(() => null) }))

const objectOptions = [
    { text: 'Option A', value: 'a' },
    { text: 'Option B', value: 'b' },
]

const withConfig = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const latestSemanticProps = () => {
    const calls = Listbox.mock.calls
    return calls[calls.length - 1][0]
}

const renderDropdown = props => render(withConfig(<Dropdown {...props} />))

describe('Dropdown parent value and option contracts', () => {
    beforeEach(() => {
        Listbox.mockClear()
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

    /**
     * NARROWED at §9.7-F1 step 3 part 2, and the reason is worth keeping: part 1 fixed a
     * DUPLICATION here — `onAddItem` wrote the label-appended array back into option state, so
     * every addition appended another label — and part 2 removed `allowAdditions`, which removed
     * the write-back and with it the only way to reach the bug. The fix is gone from the wrapper
     * too. What survives is the label itself, which is a separate prop and still used: appended
     * once, last, disabled, and carried as `content` rather than `text`.
     */
    it('appends `optionsLabel` once, as a disabled last option', () => {
        renderDropdown({ options: objectOptions, optionsLabel: 'FOOTER' })

        const options = latestSemanticProps().options
        expect(options.filter(o => o.content === 'FOOTER')).toHaveLength(1)
        expect(options[options.length - 1]).toEqual(
            expect.objectContaining({ content: 'FOOTER', disabled: true })
        )
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

    /**
     * `autofocus` went with `search` at §9.7-F1 step 3 part 2: it only ever became
     * `searchInput={{autoFocus: true}}`, which does nothing on a control that has no search
     * input, so removing search left it dead rather than merely unused. `selection` stays, and
     * stays load-bearing — `css.dropdown-contract.test.js` measures its class token as worth 12
     * of the control's 13 scoped rules.
     */
    it('lets a caller turn `selection` off, though nothing in the corpus does', () => {
        renderDropdown({ options: objectOptions, selection: false })

        expect(latestSemanticProps()).toEqual(expect.objectContaining({ selection: false }))
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

})

describe('Dropdown interaction callback contracts', () => {
    beforeEach(() => {
        Listbox.mockClear()
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

})

describe('Dropdown additions contracts', () => {
    beforeEach(() => {
        Listbox.mockClear()
    })

    /**
     * THIS USED TO ASSERT THE OPPOSITE, and the inversion is the point. Before §9.7-F1 step 3
     * part 2 it read `expect(latestSemanticProps()).toEqual(expect.objectContaining({
     * additionLabel, additionPosition, upward }))` — the addition props riding the rest spread
     * through to the library untouched. The features are gone, so at this seam the correct
     * assertion is that they no longer arrive; `Dropdown.test.js` covers what a caller who still
     * passes one now observes (a named warning, and no stray DOM attribute).
     *
     * `upward` is kept in the same test on purpose: it went the other way. It is the one prop of
     * the four that survives, because consumer metas declare it (`CONSUMER_ONLY_ATTRIBUTES`) and
     * `Listbox` implements it as the `upward` class token.
     */
    it('no longer forwards the addition props, and still forwards `upward`', () => {
        renderDropdown({
            options: objectOptions,
            allowAdditions: true,
            additionLabel: 'Create ',
            additionPosition: 'top',
            upward: true,
        })

        const handed = latestSemanticProps()
        expect(handed).toEqual(expect.objectContaining({ upward: true }))
        expect(Object.keys(handed)).not.toContain('allowAdditions')
        expect(Object.keys(handed)).not.toContain('additionLabel')
        expect(Object.keys(handed)).not.toContain('additionPosition')
    })
})
