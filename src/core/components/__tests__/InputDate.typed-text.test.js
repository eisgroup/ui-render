import React, { useState } from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import InputDate from '../InputDate'
import { ConfigContext } from '../../contexts/ConfigContext'

// WHAT A USER TYPES, through rc-picker itself: rc-picker reads typed text strictly in the field's formats, hands on
// only a date it reads, and confirms it once the field is left. Each test types as a user does: the field takes the
// focus, its text changes, and it loses the focus. rc-picker closes and confirms a frame or two later.

const config = { dateFormat: 'MM-DD-YYYY' }

/**
 * The field as a document renders it: its value comes back through `onChange`, and it renders again when it is left,
 * as a field marked touched does.
 */
function Field ({ initial = null, onChange, onInvalidText }) {
    const [value, setValue] = useState(initial)
    const [, setLeft] = useState(0)
    return (
        <ConfigContext.Provider value={config}>
            <InputDate
                name="startDate"
                value={value}
                onBlur={() => setLeft(left => left + 1)}
                onChange={(date) => {
                    setValue(date)
                    if (onChange) onChange(date)
                }}
                onInvalidText={onInvalidText}
            />
        </ConfigContext.Provider>
    )
}

const typeAndLeave = (input, text) => {
    act(() => input.focus())
    fireEvent.change(input, { target: { value: text } })
    act(() => input.blur())
}

/**
 * Lets rc-picker close and confirm, which it does a frame or two after the field is left. Inside `act`: React 16 and 17
 * warn about a state update made outside one, and rc-picker makes them from animation frames.
 */
const frames = () => act(() => new Promise(resolve => setTimeout(resolve, 100)))

describe('InputDate: text a user types', () => {
    it.each([
        ['an empty field', null, '11-31-2021'],
        ['an empty field', null, '02-29-2021'],
        ['a field with a date', '2022-01-01', '02-29-2021'],
        ['a field with a date', '2022-01-01', '11-31-2021'],
    ])('keeps text that is no date in %s once it is left, reports it, and changes no date (%s, %s)', async (_field, initial, text) => {
        const onChange = jest.fn()
        const onInvalidText = jest.fn()
        const { container } = render(<Field initial={initial} onChange={onChange} onInvalidText={onInvalidText}/>)
        const input = container.querySelector('input[name="startDate"]')

        typeAndLeave(input, text)
        await frames()

        expect(input).toHaveValue(text)
        expect(onInvalidText.mock.calls).toEqual([[text]])
        expect(onChange).not.toHaveBeenCalled()
    })

    it('takes a date typed and left by a click elsewhere, not only by Tab or Enter', async () => {
        // Rendered again when it is left, the field handed rc-picker a new moment of the same date, and rc-picker put
        // that date back in place of the one typed: only Tab and Enter, which confirm before the field is left, kept it.
        const onChange = jest.fn()
        const onInvalidText = jest.fn()
        const { container } = render(<Field initial="2022-01-01" onChange={onChange} onInvalidText={onInvalidText}/>)
        const input = container.querySelector('input[name="startDate"]')

        typeAndLeave(input, '11-30-2021')
        await frames()

        expect(onChange.mock.calls).toEqual([['2021-11-30']])
        expect(input).toHaveValue('11-30-2021')
        expect(onInvalidText).not.toHaveBeenCalled()
    })

    it('reports no text once it is corrected to a date, and takes the date', async () => {
        const onChange = jest.fn()
        const onInvalidText = jest.fn()
        const { container } = render(<Field initial="2022-01-01" onChange={onChange} onInvalidText={onInvalidText}/>)
        const input = container.querySelector('input[name="startDate"]')
        typeAndLeave(input, '02-29-2021')
        await frames()

        act(() => input.focus())
        fireEvent.change(input, { target: { value: '02-28-2021' } })
        // As it is corrected, before it is left: the error it explained goes with it.
        expect(onInvalidText.mock.calls).toEqual([['02-29-2021'], [null]])
        act(() => input.blur())
        await frames()

        expect(onChange.mock.calls).toEqual([['2021-02-28']])
        expect(input).toHaveValue('02-28-2021')
    })

    it('reports a date shown in place of the text, from a new value', async () => {
        const onInvalidText = jest.fn()
        const { container, rerender } = render(
            <ConfigContext.Provider value={config}>
                <InputDate name="startDate" value="2022-01-01" onInvalidText={onInvalidText}/>
            </ConfigContext.Provider>
        )
        const input = container.querySelector('input[name="startDate"]')
        typeAndLeave(input, '02-29-2021')
        await frames()

        rerender(
            <ConfigContext.Provider value={config}>
                <InputDate name="startDate" value="2022-05-05" onInvalidText={onInvalidText}/>
            </ConfigContext.Provider>
        )

        await frames()

        expect(input).toHaveValue('05-05-2022')
        expect(onInvalidText.mock.calls).toEqual([['02-29-2021'], [null]])
    })

    it('empties the date with the text, and takes no date it read before the text was emptied', async () => {
        // A date typed first is one rc-picker has read, and it confirms that date once the field is left, though the
        // text is gone by then. Until 2026-10-23 emptying the text did nothing: leaving the field showed the date again.
        const onChange = jest.fn()
        const onInvalidText = jest.fn()
        const { container } = render(<Field initial="2022-01-01" onChange={onChange} onInvalidText={onInvalidText}/>)
        const input = container.querySelector('input[name="startDate"]')

        act(() => input.focus())
        fireEvent.change(input, { target: { value: '11-30-2021' } })
        fireEvent.change(input, { target: { value: '' } })
        act(() => input.blur())
        await frames()

        expect(onChange.mock.calls).toEqual([[null]])
        expect(input).toHaveValue('')
        expect(onInvalidText).not.toHaveBeenCalled()
    })

    it('takes no date read before the text was emptied in a field that had none', async () => {
        // No date to empty, so nothing renders the field again with a new value: rc-picker would confirm the date it read.
        const onChange = jest.fn()
        const { container } = render(<Field onChange={onChange}/>)
        const input = container.querySelector('input[name="startDate"]')

        act(() => input.focus())
        fireEvent.change(input, { target: { value: '11-30-2021' } })
        fireEvent.change(input, { target: { value: '' } })
        act(() => input.blur())
        await frames()

        expect(onChange).not.toHaveBeenCalled()
        expect(input).toHaveValue('')
    })

    it('empties the date of a field left by Tab, which confirms the date read before the text was emptied', async () => {
        const onChange = jest.fn()
        const { container } = render(<Field initial="2022-01-01" onChange={onChange}/>)
        const input = container.querySelector('input[name="startDate"]')

        act(() => input.focus())
        fireEvent.change(input, { target: { value: '11-30-2021' } })
        fireEvent.change(input, { target: { value: '' } })
        fireEvent.keyDown(input, { key: 'Tab' })
        act(() => input.blur())
        await frames()

        expect(onChange.mock.calls).toEqual([['2021-11-30'], [null]])
        expect(input).toHaveValue('')
    })

    it('takes a date again once the field has the focus after it was emptied', async () => {
        const onChange = jest.fn()
        const { container } = render(<Field initial="2022-01-01" onChange={onChange}/>)
        const input = container.querySelector('input[name="startDate"]')
        typeAndLeave(input, '')
        await frames()

        typeAndLeave(input, '03-15-2022')
        await frames()

        expect(onChange.mock.calls).toEqual([[null], ['2022-03-15']])
    })

    it('takes a date read while the text was typed, and keeps the text that is no date after it', async () => {
        // rc-picker confirms the last date it read once the field is left: the field shows the text, and its owner
        // shows the error, so a submit sends nothing while the value is that date.
        const onChange = jest.fn()
        const onInvalidText = jest.fn()
        const { container } = render(<Field initial="2022-01-01" onChange={onChange} onInvalidText={onInvalidText}/>)
        const input = container.querySelector('input[name="startDate"]')

        act(() => input.focus())
        fireEvent.change(input, { target: { value: '11-30-2021' } })
        fireEvent.change(input, { target: { value: '11-30-202' } })
        act(() => input.blur())
        await frames()

        expect(onChange.mock.calls).toEqual([['2021-11-30']])
        expect(onInvalidText.mock.calls).toEqual([['11-30-202']])
        expect(input).toHaveValue('11-30-202')
    })

    it('keeps text that is no date where nothing listens for it', async () => {
        const { container } = render(<Field initial="2022-01-01"/>)
        const input = container.querySelector('input[name="startDate"]')

        typeAndLeave(input, '02-29-2021')
        await frames()

        expect(input).toHaveValue('02-29-2021')
    })
})
