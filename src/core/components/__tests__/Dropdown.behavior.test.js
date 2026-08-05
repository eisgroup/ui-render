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

        expect(onChange).toHaveBeenCalledWith('Fallback label')
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
