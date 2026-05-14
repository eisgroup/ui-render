import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from '../Input'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

describe('Input', () => {
    it('renders a basic input', () => {
        const { container } = render(wrap(<Input name="x" />))
        expect(container.querySelector('input')).toBeInTheDocument()
    })

    it('uses InputNative for type=hidden', () => {
        const { container } = render(wrap(<Input name="x" type="hidden" />))
        const input = container.querySelector('input[type="hidden"]')
        expect(input).toBeInTheDocument()
    })

    it('renders a label with htmlFor matching id', () => {
        const { container } = render(wrap(<Input name="x" label="My Field" id="my-id" />))
        const label = container.querySelector('label')
        expect(label).toHaveTextContent('My Field')
        expect(label.getAttribute('for')).toBe('my-id')
    })

    it('derives id from label when not provided', () => {
        const { container } = render(wrap(<Input label="My Field" />))
        const label = container.querySelector('label')
        expect(label.getAttribute('for')).toBe('input-My-Field')
    })

    it('renders an icon when provided', () => {
        const { container } = render(wrap(<Input name="x" icon="search" />))
        expect(container.querySelector('.icon-search')).toBeInTheDocument()
    })

    it('renders the icon on the left when lefty=true', () => {
        const { container } = render(wrap(<Input name="x" icon="search" lefty />))
        const row = container.querySelector('.input.lefty')
        expect(row).toBeInTheDocument()
        // first child of row should be the icon, before InputNative
        const iconBefore = row.children[0]
        expect(iconBefore.className).toContain('icon-search')
    })

    it('shows the unit when value is present', () => {
        const { container } = render(wrap(<Input name="x" value="42" unit="kg" onChange={() => {}} />))
        expect(container.textContent).toContain('kg')
    })

    it('renders error message under input', () => {
        const { container } = render(wrap(<Input name="x" error="Required field" />))
        expect(container.textContent).toContain('Required field')
        expect(container.querySelector('.error')).toBeInTheDocument()
    })

    it('renders info message under input', () => {
        const { container } = render(wrap(<Input name="x" info="Helpful tip" />))
        expect(container.textContent).toContain('Helpful tip')
    })

    it('handles onRemove with delete button', () => {
        const onRemove = jest.fn()
        const { container } = render(wrap(<Input name="myField" label="My" onRemove={onRemove} />))
        const deleteBtn = container.querySelector('.input__delete')
        expect(deleteBtn).toBeInTheDocument()
        fireEvent.click(deleteBtn)
        expect(onRemove).toHaveBeenCalledWith('myField')
    })

    it('does not render delete when readonly', () => {
        const onRemove = jest.fn()
        const { container } = render(wrap(<Input name="x" label="y" onRemove={onRemove} readonly />))
        expect(container.querySelector('.input__delete')).not.toBeInTheDocument()
    })

    it('renders as float label when float=true', () => {
        const { container } = render(wrap(<Input name="x" float />))
        expect(container.querySelector('.input--wrapper.float')).toBeInTheDocument()
        // float requires placeholder set to ' ' and label derived from name (capitalize)
        const label = container.querySelector('label')
        expect(label).toHaveTextContent('X') // capitalize('x')
    })

    it('applies done class when value is present and no error', () => {
        const { container } = render(wrap(<Input name="x" value="abc" onChange={() => {}} />))
        expect(container.querySelector('.input--wrapper.done')).toBeInTheDocument()
    })

    it('sets active state on focus', () => {
        const { container } = render(wrap(<Input name="x" />))
        const input = container.querySelector('input')
        fireEvent.focus(input)
        expect(container.querySelector('.input.active')).toBeInTheDocument()
    })

    it('applies swatch class for type=color', () => {
        const { container } = render(wrap(<Input name="x" type="color" />))
        expect(container.querySelector('.input--wrapper.swatch')).toBeInTheDocument()
    })

    it('marks as required', () => {
        const { container } = render(wrap(<Input name="x" required />))
        expect(container.querySelector('.input--wrapper.required')).toBeInTheDocument()
    })

    it('renders children at the end', () => {
        const { container } = render(
            wrap(<Input name="x"><span data-testid="extra">extra</span></Input>)
        )
        expect(container.querySelector('[data-testid="extra"]')).toBeInTheDocument()
    })
})
