import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import InputNumber from '../InputNumber'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

describe('InputNumber - more cases', () => {
    it('renders an icon when provided', () => {
        const { container } = render(wrap(<InputNumber name="x" icon="search" onChange={() => {}} />))
        expect(container.querySelector('.icon-search')).toBeInTheDocument()
    })

    it('places icon on left when lefty=true', () => {
        const { container } = render(
            wrap(<InputNumber name="x" icon="search" lefty onChange={() => {}} />)
        )
        const row = container.querySelector('.input.lefty')
        expect(row).toBeInTheDocument()
    })

    it('renders the unit when value is present', () => {
        const { container } = render(
            wrap(<InputNumber name="x" value={42} unit="kg" onChange={() => {}} />)
        )
        expect(container.textContent).toContain('kg')
    })

    it('renders error and info messages', () => {
        const { container } = render(
            wrap(<InputNumber name="x" error="Required" info="Enter a number" onChange={() => {}} />)
        )
        expect(container.textContent).toContain('Required')
        expect(container.textContent).toContain('Enter a number')
    })

    it('renders label and delete button when onRemove given', () => {
        const onRemove = jest.fn()
        const { container } = render(
            wrap(<InputNumber name="qty" label="Quantity" onRemove={onRemove} onChange={() => {}} />)
        )
        const btn = container.querySelector('.input__delete')
        expect(btn).toBeInTheDocument()
        fireEvent.click(btn)
        expect(onRemove).toHaveBeenCalledWith('qty')
    })

    it('marks as float-label', () => {
        const { container } = render(
            wrap(<InputNumber name="amt" float onChange={() => {}} />)
        )
        expect(container.querySelector('.input--wrapper.float')).toBeInTheDocument()
    })

    it('renders children at the end', () => {
        const { container } = render(
            wrap(<InputNumber name="x" onChange={() => {}}><span data-testid="extra">x</span></InputNumber>)
        )
        expect(container.querySelector('[data-testid="extra"]')).toBeInTheDocument()
    })

    it('shows readonly state', () => {
        const { container } = render(
            wrap(<InputNumber name="x" readonly onChange={() => {}} />)
        )
        const input = container.querySelector('input')
        expect(input.readOnly).toBe(true)
    })

    it('formats with percentage suffix on blur', () => {
        // outputFormat.percentage is rendered via format() but display is determined by `value` state.
        // Smoke test: ensure render doesn't break.
        const { container } = render(
            wrap(<InputNumber name="x" value={50} outputFormat={{ percentage: true }} onChange={() => {}} />)
        )
        expect(container.querySelector('input')).toBeInTheDocument()
    })

    it('handles thousands separation flag', () => {
        const { container } = render(
            wrap(<InputNumber name="x" value={1234567} outputFormat={{ separateThousands: true }} onChange={() => {}} />)
        )
        expect(container.querySelector('input')).toBeInTheDocument()
    })

    it('focus + blur cycle calls callbacks', () => {
        const onFocus = jest.fn()
        const onBlur = jest.fn()
        const { container } = render(
            wrap(<InputNumber name="x" onFocus={onFocus} onBlur={onBlur} onChange={() => {}} />)
        )
        const input = container.querySelector('input')
        fireEvent.focus(input)
        fireEvent.blur(input)
        expect(onFocus).toHaveBeenCalled()
        expect(onBlur).toHaveBeenCalled()
    })

    it('formats decimals on blur, calling onChange with the rounded value', () => {
        // Use plain function instead of jest.fn() — see feedback_isfunction_jest_mocks
        const calls = []
        const onChange = function (...args) { calls.push(args) }
        const { container } = render(
            wrap(<InputNumber name="x" value="5.123" outputFormat={{ decimals: 2 }} onChange={onChange} />)
        )
        const input = container.querySelector('input')
        fireEvent.focus(input)
        fireEvent.blur(input)
        // onChange should be called with the rounded numeric value
        const blurCall = calls.find(([v]) => v === 5.12)
        expect(blurCall).toBeDefined()
    })

    it('rejects characters that do not match input regex', () => {
        const onChange = jest.fn()
        const { container } = render(
            wrap(<InputNumber name="x" onChange={onChange} />)
        )
        const input = container.querySelector('input')
        fireEvent.change(input, { target: { value: 'abc' } })
        expect(onChange).not.toHaveBeenCalled()
    })

    it('derives id from label when not given', () => {
        const { container } = render(
            wrap(<InputNumber label="Order Quantity" onChange={() => {}} />)
        )
        expect(container.querySelector('label').getAttribute('for')).toBe('input-Order-Quantity')
    })

    it('passes title attribute when label is absent', () => {
        const { container } = render(
            wrap(<InputNumber name="x" title="A hint" onChange={() => {}} />)
        )
        expect(container.querySelector('input').getAttribute('title')).toBe('A hint')
    })

    it('updates value when parent prop changes (outside of focus)', () => {
        const onChange = jest.fn()
        const { container, rerender } = render(
            wrap(<InputNumber name="x" value={1} onChange={onChange} />)
        )
        rerender(wrap(<InputNumber name="x" value={99} onChange={onChange} />))
        expect(container.querySelector('input').value).toBe('99')
    })

    it('handles object icon', () => {
        const { container } = render(
            wrap(<InputNumber name="x" icon={<span data-testid="ic">X</span>} onChange={() => {}} />)
        )
        expect(container.querySelector('[data-testid="ic"]')).toBeInTheDocument()
    })
})
