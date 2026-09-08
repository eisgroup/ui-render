import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Dropdown } from '../Dropdown'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const options = [
    { text: 'Option A', value: 'a' },
    { text: 'Option B', value: 'b' },
]

describe('Dropdown - allowAdditions', () => {
})

describe('Dropdown - array value (color-like)', () => {
    it('joins array value into a comma-separated string for single-select', () => {
        const { container } = render(wrap(
            <Dropdown options={[{ text: 'Red', value: [255, 0, 0] }]} value={[255, 0, 0]} />
        ))
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })

})

describe('Dropdown - additional behaviors', () => {
    it('renders optionsLabel as a disabled item', () => {
        const { container } = render(wrap(
            <Dropdown options={options} optionsLabel="Add new..." onChange={() => {}} />
        ))
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })

    /**
     * REWRITTEN at §9.7-F1 step 3 part 1. The old body looked for `.icon.pointer` and wrapped its
     * only assertion in `if (icon)` — and the rendered class is `icon-dropdown pointer`, so the
     * selector matched NOTHING and the test passed having asserted nothing, on every run since it
     * was written. Measured selector, unconditional assertions, and a plain function rather than
     * `jest.fn()` per the house rule.
     */
    it('wires onClickIcon by rendering a clickable Icon', () => {
        const clicks = []
        const { container } = render(wrap(
            <Dropdown options={options} onClickIcon={() => clicks.push('clicked')} />
        ))

        const icon = container.querySelector('i.icon-dropdown.pointer')
        expect(icon).not.toBeNull()

        fireEvent.click(icon)
        expect(clicks).toEqual(['clicked'])
    })

    it('falls through to onSelect via onClose handler', () => {
        const onSelect = jest.fn()
        const { container } = render(wrap(
            <Dropdown options={options} onSelect={onSelect} onChange={() => {}} />
        ))
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })

    it('disables when readonly is true', () => {
        const { container } = render(wrap(
            <Dropdown options={options} readonly />
        ))
        expect(container.querySelector('.disabled.dropdown, .ui.dropdown.disabled')).toBeInTheDocument()
    })

    it('sanitizes string options into {text, value} objects', () => {
        const { container } = render(wrap(<Dropdown options={['a', 'b']} />))
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })

    it('sanitizes number options into {text, value} objects', () => {
        const { container } = render(wrap(<Dropdown options={[1, 2, 3]} />))
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })

    it('done prop explicitly false skips the done class', () => {
        const { container } = render(wrap(<Dropdown options={options} done={false} value="a" />))
        expect(container.querySelector('.input--wrapper.done')).not.toBeInTheDocument()
    })

    it('done prop explicitly true forces the done class', () => {
        const { container } = render(wrap(<Dropdown options={options} done={true} />))
        expect(container.querySelector('.input--wrapper.done')).toBeInTheDocument()
    })

    it('renders error and info messages', () => {
        const { container } = render(
            wrap(<Dropdown options={options} error="Required" info="Pick one" />)
        )
        expect(container.textContent).toContain('Required')
        expect(container.textContent).toContain('Pick one')
    })

    it('renders float label', () => {
        const { container } = render(
            wrap(<Dropdown options={options} label="Color" float />)
        )
        expect(container.querySelector('.input--wrapper.float')).toBeInTheDocument()
    })

    it('marks as required', () => {
        const { container } = render(
            wrap(<Dropdown options={options} required />)
        )
        expect(container.querySelector('.input--wrapper.required')).toBeInTheDocument()
    })
})
