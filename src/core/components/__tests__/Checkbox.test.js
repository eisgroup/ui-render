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

// Since 2026-10-06. A box derives its id from its label, so two boxes with one label shared it, and a
// `<label for>` finds the first element with an id: the second box's label checked the first box.
describe('Checkbox: an id of its own', () => {
    const ids = () => Array.from(document.querySelectorAll('input[type="checkbox"]')).map(input => input.id)
    const labelOf = input => document.querySelector(`label[for="${input.id}"]`)

    it('keeps the id it derives from its label when it is the only box with that label', () => {
        render(<Checkbox label="Expand All" onChange={() => {}} />)
        expect(ids()).toEqual(['checkbox-Expand-All'])
    })

    it('leaves the first box with a label its id, gives the others the next free ones, and each label checks its own', () => {
        render(
            <>
                <Checkbox label="Expand All" onChange={() => {}} />
                <Checkbox label="Expand All" onChange={() => {}} />
                <Checkbox label="Expand All" onChange={() => {}} />
            </>
        )
        expect(ids()).toEqual(['checkbox-Expand-All', 'checkbox-Expand-All-2', 'checkbox-Expand-All-3'])

        const [first, second] = document.querySelectorAll('input[type="checkbox"]')
        fireEvent.click(labelOf(second))
        expect(second).toBeChecked()
        expect(first).not.toBeChecked()
    })

    it('renames a box that mounts beside one that already holds the id, not the one that held it', () => {
        const Page = ({ both }) => (
            <>
                <Checkbox label="Expand All" onChange={() => {}} />
                {both && <Checkbox label="Expand All" onChange={() => {}} />}
            </>
        )
        const { rerender } = render(<Page both={false} />)
        rerender(<Page both />)
        expect(ids()).toEqual(['checkbox-Expand-All', 'checkbox-Expand-All-2'])
    })

    it('uses an id the meta gives as given, shared or not', () => {
        render(
            <>
                <Checkbox id="agree" label="Agree" onChange={() => {}} />
                <Checkbox id="agree" label="Agree" onChange={() => {}} />
            </>
        )
        expect(ids()).toEqual(['agree', 'agree'])
    })
})
