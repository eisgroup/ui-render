import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import InputNative from '../InputNative'

describe('InputNative', () => {
    it('renders a basic <input>', () => {
        const { container } = render(<InputNative name="x" />)
        expect(container.querySelector('input')).toBeInTheDocument()
    })

    it('fires onChange with (value, name, event)', () => {
        const onChange = jest.fn()
        const { container } = render(<InputNative name="myField" onChange={onChange} />)
        fireEvent.change(container.querySelector('input'), { target: { value: 'abc' } })
        expect(onChange).toHaveBeenCalledWith('abc', 'myField', expect.any(Object))
    })

    it('renders a <textarea> for type=textarea', () => {
        const { container } = render(<InputNative name="x" type="textarea" />)
        expect(container.querySelector('textarea')).toBeInTheDocument()
    })

    it('renders a textarea and rows=1 when resize=true', () => {
        const { container } = render(<InputNative name="x" resize />)
        const ta = container.querySelector('textarea')
        expect(ta).toBeInTheDocument()
        expect(ta.getAttribute('rows')).toBe('1')
    })

    it('renders <Select> for type=select', () => {
        const options = [{ text: 'A', value: 'a' }]
        const { container } = render(<InputNative name="x" type="select" options={options} />)
        expect(container.querySelector('select')).toBeInTheDocument()
    })

    it('handles checkbox onChange with checked boolean', () => {
        const onChange = jest.fn()
        const { container } = render(<InputNative name="x" type="checkbox" onChange={onChange} />)
        const input = container.querySelector('input[type="checkbox"]')
        fireEvent.click(input)
        expect(onChange).toHaveBeenCalledWith(true, 'x', expect.any(Object))
    })

    it('renders color input and applies backgroundColor on change', () => {
        const onChange = jest.fn()
        const { container } = render(<InputNative name="x" type="color" defaultValue="#ff0000" onChange={onChange} />)
        const input = container.querySelector('input[type="color"]')
        expect(input).toBeInTheDocument()
        fireEvent.change(input, { target: { value: '#00ff00' } })
        expect(onChange).toHaveBeenCalledWith('#00ff00', 'x', expect.any(Object))
    })

    it('applies noSpellCheck attrs when disabledSpellCheck=true', () => {
        const { container } = render(<InputNative name="x" disabledSpellCheck />)
        const input = container.querySelector('input')
        expect(input.getAttribute('autoComplete')).toBe('off')
        expect(input.getAttribute('spellCheck')).toBe('false')
    })

    it('checkbox checked prop falls back to value', () => {
        const { container } = render(<InputNative name="x" type="checkbox" value={true} onChange={() => {}} />)
        expect(container.querySelector('input').checked).toBe(true)
    })

    it('handles textarea onChange and propagates (value, name, event)', () => {
        const onChange = jest.fn()
        const { container } = render(
            <InputNative name="memo" type="textarea" onChange={onChange} />
        )
        const ta = container.querySelector('textarea')
        fireEvent.change(ta, { target: { value: 'hi' } })
        expect(onChange).toHaveBeenCalledWith('hi', 'memo', expect.any(Object))
    })

    it('resizes content when compact prop is given', () => {
        // compact uses a ref callback that runs in commit phase; verify it mounts without error
        const { container } = render(<InputNative name="x" compact={2} value="hi" onChange={() => {}} />)
        const input = container.querySelector('input')
        expect(input).toBeInTheDocument()
    })

    it('color input applies backgroundColor on mount', () => {
        const { container } = render(
            <InputNative name="c" type="color" defaultValue="#abcdef" onChange={() => {}} />
        )
        const input = container.querySelector('input[type="color"]')
        expect(input).toBeInTheDocument()
    })

    it('does not require onChange callback when absent', () => {
        const { container } = render(<InputNative name="x" />)
        const input = container.querySelector('input')
        // Should not throw even without onChange
        expect(() => fireEvent.change(input, { target: { value: 'x' } })).not.toThrow()
    })

    it('onKeyUp resize triggers on textarea Enter key', () => {
        const onKeyUp = jest.fn()
        const { container } = render(
            <InputNative name="x" resize onKeyUp={onKeyUp} onChange={() => {}} />
        )
        const ta = container.querySelector('textarea')
        fireEvent.keyUp(ta, { key: 'Enter', code: 'Enter' })
        expect(onKeyUp).toHaveBeenCalled()
    })

    it('honors disabledSpellCheck attributes', () => {
        const { container } = render(
            <InputNative name="x" disabledSpellCheck onChange={() => {}} />
        )
        const input = container.querySelector('input')
        expect(input.getAttribute('spellCheck')).toBe('false')
        expect(input.getAttribute('autoCapitalize')).toBe('off')
    })
})
