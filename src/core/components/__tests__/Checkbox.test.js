import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Checkbox } from '../Checkbox'

describe('Checkbox', () => {
    it('renders an unchecked input by default', () => {
        const { container } = render(<Checkbox label="Agree" onChange={() => {}} />)
        const input = container.querySelector('input[type="checkbox"]')
        expect(input).toBeInTheDocument()
        expect(input).not.toBeChecked()
    })

    it('renders checked when value matches valueTrue', () => {
        const { container } = render(
            <Checkbox label="x" value={true} onChange={() => {}} />
        )
        expect(container.querySelector('input')).toBeChecked()
    })

    it('renders checked when value === custom valueTrue', () => {
        const { container } = render(
            <Checkbox label="x" valueTrue="Y" value="Y" onChange={() => {}} />
        )
        expect(container.querySelector('input')).toBeChecked()
    })

    it('calls onChange with valueTrue/valueFalse on toggle', () => {
        const onChange = jest.fn()
        const { container } = render(
            <Checkbox label="x" valueTrue="Y" valueFalse="N" onChange={onChange} />
        )
        const input = container.querySelector('input')
        fireEvent.click(input)
        expect(onChange).toHaveBeenCalled()
        expect(onChange.mock.calls[0][0]).toBe('Y')
    })

    it('uses defaultChecked when value is null and defaultValue is set', () => {
        const { container } = render(
            <Checkbox label="x" defaultValue={true} onChange={() => {}} />
        )
        // jsdom reflects defaultChecked into checked prop
        expect(container.querySelector('input').defaultChecked).toBe(true)
    })

    it('disables onChange callback when readonly', () => {
        const onChange = jest.fn()
        const { container } = render(
            <Checkbox label="x" readonly onChange={onChange} />
        )
        fireEvent.click(container.querySelector('input'))
        expect(onChange).not.toHaveBeenCalled()
    })

    it('renders toggle type with extra labels', () => {
        const { container } = render(
            <Checkbox label="x" type="toggle" labelTrue="ON" labelFalse="OFF" onChange={() => {}} />
        )
        expect(container.textContent).toContain('ON')
        expect(container.textContent).toContain('OFF')
    })

    it('derives id from label when not provided', () => {
        const { container } = render(<Checkbox label="Agree to terms" onChange={() => {}} />)
        const input = container.querySelector('input')
        expect(input.id).toBe('checkbox-Agree-to-terms')
    })
})
