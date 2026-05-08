import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import InputNumber from '../InputNumber'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const renderInput = (props = {}) => {
    const onChange = props.onChange || jest.fn()
    const utils = render(
        <ConfigContext.Provider value={initialConfigState}>
            <InputNumber name="value" onChange={onChange} {...props} />
        </ConfigContext.Provider>
    )
    return { ...utils, onChange, input: utils.container.querySelector('input') }
}

describe('InputNumber', () => {
    describe('basic input', () => {
        it('renders without crashing', () => {
            const { input } = renderInput()
            expect(input).toBeInTheDocument()
        })

        it('accepts plain integer input', () => {
            const { input, onChange } = renderInput()
            fireEvent.change(input, { target: { value: '42' } })
            expect(onChange).toHaveBeenLastCalledWith(42, 'value', expect.anything())
        })

        it('accepts decimal input when decimals not restricted', () => {
            const { input, onChange } = renderInput()
            fireEvent.change(input, { target: { value: '3.14' } })
            expect(onChange).toHaveBeenLastCalledWith(3.14, 'value', expect.anything())
        })

        it('normalizes comma to dot for decimal separator', () => {
            const { input, onChange } = renderInput()
            fireEvent.change(input, { target: { value: '3,14' } })
            expect(onChange).toHaveBeenLastCalledWith(3.14, 'value', expect.anything())
        })

        it('accepts negative input when no min constraint', () => {
            const { input, onChange } = renderInput()
            fireEvent.change(input, { target: { value: '-5' } })
            expect(onChange).toHaveBeenLastCalledWith(-5, 'value', expect.anything())
        })
    })

    describe('min: 0 (non-negative constraint)', () => {
        it('rejects standalone minus sign on input', () => {
            const { input, onChange } = renderInput({ min: 0 })
            fireEvent.change(input, { target: { value: '-' } })
            expect(input.value).toBe('')
            expect(onChange).not.toHaveBeenCalled()
        })

        it('rejects negative whole number on input', () => {
            const { input, onChange } = renderInput({ min: 0 })
            fireEvent.change(input, { target: { value: '-5' } })
            expect(input.value).toBe('')
            expect(onChange).not.toHaveBeenCalled()
        })

        it('rejects negative decimal on input', () => {
            const { input, onChange } = renderInput({ min: 0 })
            fireEvent.change(input, { target: { value: '-0.5' } })
            expect(input.value).toBe('')
            expect(onChange).not.toHaveBeenCalled()
        })

        it('still accepts positive values', () => {
            const { input, onChange } = renderInput({ min: 0 })
            fireEvent.change(input, { target: { value: '5' } })
            expect(onChange).toHaveBeenLastCalledWith(5, 'value', expect.anything())
        })

        it('still accepts zero', () => {
            const { input, onChange } = renderInput({ min: 0 })
            fireEvent.change(input, { target: { value: '0' } })
            expect(onChange).toHaveBeenLastCalledWith(0, 'value', expect.anything())
        })

        it('clamps to min on blur if value is below min', () => {
            // Parent supplies a negative value (e.g. legacy data); blur must clamp.
            const onChange = jest.fn()
            const { input } = renderInput({ min: 0, value: -3, onChange })
            fireEvent.focus(input)
            fireEvent.blur(input)
            expect(onChange).toHaveBeenLastCalledWith(0, 'value', expect.anything())
        })

        it('allows positive minus sign for min > 0 if min itself negative is forbidden but min < 0 allows it', () => {
            // sanity check: min: -10 still allows minus
            const { input, onChange } = renderInput({ min: -10 })
            fireEvent.change(input, { target: { value: '-5' } })
            expect(onChange).toHaveBeenLastCalledWith(-5, 'value', expect.anything())
        })
    })

    describe('outputFormat.decimals: 0 (no decimals constraint)', () => {
        it('rejects appended dot after typing an integer', () => {
            const { input } = renderInput({ outputFormat: { decimals: 0 } })
            fireEvent.change(input, { target: { value: '5' } })
            fireEvent.change(input, { target: { value: '5.' } })
            expect(input.value).toBe('5')
        })

        it('rejects appended comma after typing an integer', () => {
            const { input } = renderInput({ outputFormat: { decimals: 0 } })
            fireEvent.change(input, { target: { value: '5' } })
            fireEvent.change(input, { target: { value: '5,' } })
            expect(input.value).toBe('5')
        })

        it('rejects fractional input pasted in one shot', () => {
            const { input, onChange } = renderInput({ outputFormat: { decimals: 0 } })
            fireEvent.change(input, { target: { value: '5.5' } })
            expect(input.value).toBe('')
            expect(onChange).not.toHaveBeenCalled()
        })

        it('still allows multi-digit integers', () => {
            const { input, onChange } = renderInput({ outputFormat: { decimals: 0 } })
            fireEvent.change(input, { target: { value: '123' } })
            expect(onChange).toHaveBeenLastCalledWith(123, 'value', expect.anything())
        })
    })

    describe('combined min: 0 + decimals: 0 (integer ≥ 0)', () => {
        it('rejects negative decimal -0.5', () => {
            // The reproducer from GENESIS-330655.
            const { input, onChange } = renderInput({ min: 0, outputFormat: { decimals: 0 } })
            fireEvent.change(input, { target: { value: '-0.5' } })
            expect(input.value).toBe('')
            expect(onChange).not.toHaveBeenCalled()
        })

        it('rejects negative integer -5', () => {
            // The other reproducer: kdanilova reported -5 still passed.
            const { input, onChange } = renderInput({ min: 0, outputFormat: { decimals: 0 } })
            fireEvent.change(input, { target: { value: '-5' } })
            expect(input.value).toBe('')
            expect(onChange).not.toHaveBeenCalled()
        })

        it('accepts non-negative integer', () => {
            const { input, onChange } = renderInput({ min: 0, outputFormat: { decimals: 0 } })
            fireEvent.change(input, { target: { value: '5' } })
            expect(onChange).toHaveBeenLastCalledWith(5, 'value', expect.anything())
        })
    })

    describe('max constraint', () => {
        it('clamps to max on blur if value is above max', () => {
            const onChange = jest.fn()
            const { input } = renderInput({ max: 100, value: 150, onChange })
            fireEvent.focus(input)
            fireEvent.blur(input)
            expect(onChange).toHaveBeenLastCalledWith(100, 'value', expect.anything())
        })

        it('does not clamp on blur when value is within range', () => {
            const onChange = jest.fn()
            const { input } = renderInput({ min: 0, max: 100, value: 50, onChange })
            fireEvent.focus(input)
            fireEvent.blur(input)
            // onChange may be called for formatting but not with a clamped value
            const calls = onChange.mock.calls
            calls.forEach(([v]) => expect(Number(v)).toBe(50))
        })
    })
})
