import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Select } from '../Select'

const defaultOptions = [
    { text: 'Option A', value: 'a' },
    { text: 'Option B', value: 'b' },
    { text: 'Option C', value: 'c' },
]

describe('Select', () => {
    it('renders a native <select> element', () => {
        const { container } = render(
            <Select name="test" options={defaultOptions} />
        )
        expect(container.querySelector('select')).toBeInTheDocument()
    })

    it('renders all options', () => {
        render(<Select name="test" options={defaultOptions} />)
        const options = screen.getAllByRole('option')
        // +1 for the placeholder/disabled option
        expect(options.length).toBe(defaultOptions.length + 1)
        expect(options[1]).toHaveTextContent('Option A')
        expect(options[2]).toHaveTextContent('Option B')
        expect(options[3]).toHaveTextContent('Option C')
    })

    it('renders correct option values', () => {
        render(<Select name="test" options={defaultOptions} />)
        const options = screen.getAllByRole('option')
        expect(options[1]).toHaveValue('a')
        expect(options[2]).toHaveValue('b')
        expect(options[3]).toHaveValue('c')
    })

    it('calls onChange with value and name when selection changes', () => {
        // Note: isFunction from ui-utils-pack doesn't recognize jest.fn() (different constructor),
        // so we wrap in a real function to enable controlled mode.
        const spy = jest.fn()
        const handleChange = (value, name, event) => spy(value, name, event)
        const { container } = render(
            <Select name="region" options={defaultOptions} onChange={handleChange} value="" />
        )
        const select = container.querySelector('select')
        fireEvent.change(select, { target: { value: 'b' } })
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith('b', 'region', expect.any(Object))
    })

    it('renders with controlled value', () => {
        const onChange = (v) => {}
        const { container } = render(
            <Select name="test" options={defaultOptions} onChange={onChange} value="b" />
        )
        const select = container.querySelector('select')
        expect(select).toHaveValue('b')
    })

    it('converts string options to objects', () => {
        render(<Select name="test" options={['Red', 'Green', 'Blue']} />)
        const options = screen.getAllByRole('option')
        expect(options[1]).toHaveTextContent('Red')
        expect(options[1]).toHaveValue('Red')
    })

    it('converts number options to objects', () => {
        render(<Select name="test" options={[10, 20, 30]} />)
        const options = screen.getAllByRole('option')
        expect(options[1]).toHaveTextContent('10')
    })

    it('throws when value is provided without onChange', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => {
            render(<Select name="test" options={defaultOptions} value="a" />)
        }).toThrow('Select.value is only used when `onChange` or `readOnly` provided')
        consoleError.mockRestore()
    })

    it('renders placeholder when provided', () => {
        render(<Select name="test" options={defaultOptions} placeholder="Choose one..." />)
        const placeholder = screen.getByText('Choose one...')
        expect(placeholder).toBeInTheDocument()
        expect(placeholder).toBeDisabled()
    })

    it('uses defaultValue in uncontrolled mode', () => {
        render(<Select name="test" options={defaultOptions} defaultValue="b" />)
        const select = screen.getByRole('combobox')
        expect(select).toHaveValue('b')
    })

    it('applies className to wrapper div', () => {
        const { container } = render(
            <Select name="test" options={defaultOptions} className="custom-class" />
        )
        expect(container.firstChild).toHaveClass('select', 'custom-class')
    })

    it('applies inline style to wrapper div', () => {
        const { container } = render(
            <Select name="test" options={defaultOptions} style={{ width: '200px' }} />
        )
        expect(container.firstChild).toHaveStyle({ width: '200px' })
    })

    it('renders sr-only label for accessibility', () => {
        const { container } = render(
            <Select name="region" options={defaultOptions} />
        )
        const label = container.querySelector('label.sr-only')
        expect(label).toBeInTheDocument()
        expect(label).toHaveTextContent('Select region')
    })

    it('sets correct id linking label to select', () => {
        const { container } = render(
            <Select name="region" options={defaultOptions} />
        )
        const select = container.querySelector('select')
        const label = container.querySelector('label')
        expect(select).toHaveAttribute('id', 'select-region')
        expect(label).toHaveAttribute('for', 'select-region')
    })

    it('allows custom id', () => {
        const { container } = render(
            <Select name="region" id="my-id" options={defaultOptions} />
        )
        expect(container.querySelector('select')).toHaveAttribute('id', 'my-id')
    })

    it('uses option.key for React key when provided', () => {
        const optionsWithKeys = [
            { text: 'A', value: 'a', key: 'key-a' },
            { text: 'B', value: 'b', key: 'key-b' },
        ]
        // Should render without warnings about duplicate keys
        const { container } = render(
            <Select name="test" options={optionsWithKeys} />
        )
        const options = container.querySelectorAll('option')
        expect(options.length).toBeGreaterThan(0)
    })

    it('uses text as value when option.value is null', () => {
        const opts = [{ text: 'TextOnly', value: null }]
        render(<Select name="test" options={opts} />)
        const option = screen.getByText('TextOnly')
        expect(option).toHaveValue('TextOnly')
    })

    it('passes additional props to <select>', () => {
        const onChange = (v) => {}
        const { container } = render(
            <Select name="test" options={defaultOptions} onChange={onChange} value="" disabled />
        )
        expect(container.querySelector('select')).toBeDisabled()
    })
})
