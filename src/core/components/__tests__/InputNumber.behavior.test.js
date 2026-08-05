import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import InputNumber from '../InputNumber'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const renderNumber = (props = {}) => {
    const utils = render(wrap(<InputNumber name="amount" {...props} />))

    return {
        ...utils,
        input: utils.container.querySelector('input'),
        rerenderNumber: nextProps => utils.rerender(
            wrap(<InputNumber name="amount" {...nextProps} />)
        ),
    }
}

describe('InputNumber formatting and parsing contracts', () => {
    it('shows a percentage while idle and exposes the raw number while editing', () => {
        const { input } = renderNumber({
            value: 12.5,
            outputFormat: { percentage: true },
        })

        expect(input).toHaveValue('12.5 %')

        fireEvent.focus(input)
        expect(input).toHaveValue('12.5')

        fireEvent.blur(input)
        expect(input).toHaveValue('12.5 %')
    })

    it('separates thousands without losing the fractional part', () => {
        const { input } = renderNumber({
            value: 1234567.89,
            outputFormat: { separateThousands: true },
        })

        expect(input).toHaveValue('1 234 567.89')

        fireEvent.focus(input)
        expect(input).toHaveValue('1234567.89')
    })

    it('parses a formatted percentage before notifying the caller', () => {
        const calls = []
        const onChange = (value, name, event) => calls.push([value, name, event.type])
        const { input } = renderNumber({
            outputFormat: { percentage: true },
            onChange,
        })

        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '25 %' } })

        expect(calls).toEqual([[25, 'amount', 'change']])
        expect(input).toHaveValue('25')
    })

    it('parses space-separated thousands before notifying the caller', () => {
        const calls = []
        const onChange = (value, name, event) => calls.push([value, name, event.type])
        const { input } = renderNumber({
            outputFormat: { separateThousands: true },
            onChange,
        })

        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '2 500.5' } })

        expect(calls).toEqual([[2500.5, 'amount', 'change']])
        expect(input).toHaveValue('2500.5')

        calls.length = 0
        fireEvent.change(input, { target: { value: '' } })
        expect(calls).toEqual([['', 'amount', 'change']])
        expect(input).toHaveValue('')
    })

    it('does not render a percentage suffix for an empty value', () => {
        const { input } = renderNumber({ outputFormat: { percentage: true } })

        expect(input).toHaveValue('')
    })

    it('does not decorate an incomplete numeric token on blur', () => {
        const { input } = renderNumber({
            outputFormat: { percentage: true },
            onChange: jest.fn(),
        })

        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '-' } })
        fireEvent.blur(input)

        expect(input).toHaveValue('-')
    })
})

describe('InputNumber controlled and uncontrolled value contracts', () => {
    it('defers parent updates during editing and applies the latest value on blur', () => {
        const onChange = jest.fn()
        const { input, rerenderNumber } = renderNumber({ value: 10, onChange })

        fireEvent.focus(input)
        rerenderNumber({ value: 20, onChange })
        expect(input).toHaveValue('10')

        fireEvent.change(input, { target: { value: '11' } })
        rerenderNumber({ value: 30, onChange })
        expect(input).toHaveValue('11')

        fireEvent.blur(input)
        expect(input).toHaveValue('30')
    })

    it('clears the display when the parent removes its value', () => {
        const onChange = jest.fn()
        const { input, rerenderNumber } = renderNumber({ value: 4, onChange })

        rerenderNumber({ onChange })

        expect(input).toHaveValue('')
    })

    it('uses defaultValue to initialize an uncontrolled field', () => {
        const { input } = renderNumber({ defaultValue: 7, onChange: jest.fn() })

        expect(input).toHaveValue('7')
    })

    it('remains editable when no onChange callback is supplied', () => {
        const { input } = renderNumber()

        expect(() => {
            fireEvent.change(input, { target: { value: '7' } })
        }).not.toThrow()
        expect(input).toHaveValue('7')
    })
})

describe('InputNumber blur and invalid-input contracts', () => {
    it('clamps a typed value to a negative minimum and emits the blur event', () => {
        const calls = []
        const onChange = (value, name, event) => calls.push([value, name, event.type])
        const { input } = renderNumber({ min: -10, onChange })

        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '-20' } })
        calls.length = 0
        fireEvent.blur(input)

        expect(input).toHaveValue('-10')
        expect(calls).toEqual([[-10, 'amount', 'blur']])
    })

    it('does not emit a redundant change for a value already at configured precision', () => {
        const onChange = jest.fn()
        const { input } = renderNumber({
            value: '5.12',
            outputFormat: { decimals: 2 },
            onChange,
        })

        fireEvent.focus(input)
        onChange.mockClear()
        fireEvent.blur(input)

        expect(input).toHaveValue('5.12')
        expect(onChange).not.toHaveBeenCalled()
    })

    it.each([
        ['-', '-'],
        ['-.', '-.'],
        ['1.', '1.'],
    ])('keeps incomplete numeric token %s as text', (typed, expected) => {
        const onChange = jest.fn()
        const { input } = renderNumber({ onChange })

        fireEvent.change(input, { target: { value: typed } })

        expect(onChange).toHaveBeenLastCalledWith(expected, 'amount', expect.anything())
        expect(input).toHaveValue(expected)
    })

    it('reports an empty string when the user clears the field', () => {
        const onChange = jest.fn()
        const { input } = renderNumber({ value: 7, onChange })

        fireEvent.change(input, { target: { value: '' } })

        expect(onChange).toHaveBeenLastCalledWith('', 'amount', expect.anything())
        expect(input).toHaveValue('')
    })

    it('rejects a second decimal separator without losing the last valid value', () => {
        const onChange = jest.fn()
        const { input } = renderNumber({ onChange })
        fireEvent.change(input, { target: { value: '12.3' } })
        onChange.mockClear()

        fireEvent.change(input, { target: { value: '12.3.4' } })

        expect(input).toHaveValue('12.3')
        expect(onChange).not.toHaveBeenCalled()
    })

    it('renders a controlled sticky placeholder without reading a removed prop', () => {
        const { container } = renderNumber({
            value: 12,
            stickyPlaceholder: true,
            placeholder: '12345',
            onChange: jest.fn(),
        })

        expect(container.querySelector('.input__unit')).toHaveTextContent('12345')
    })
})
