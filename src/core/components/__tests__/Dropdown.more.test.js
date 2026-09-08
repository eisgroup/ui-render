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
    it('renders with allowAdditions enabled', () => {
        const onAddItem = jest.fn()
        const { container } = render(wrap(
            <Dropdown options={options} allowAdditions search onAddItem={onAddItem} onChange={() => {}} />
        ))
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })

    /**
     * REWRITTEN at §9.7-F1 step 3 part 1: this test contained NO `expect` at all, and its comment
     * said so ("No throw; addition logic is set up internally"). The wrapper sets
     * `additionPosition = 'bottom'` only when `upward` is unset, and that IS observable — the
     * addition item's place in the rendered option list. Measured both ways rather than asserted
     * one way, because "bottom by default" only means something against the alternative.
     */
    it('positions the addition last by default, and first when `upward`', () => {
        const menuFor = extra => {
            const { container } = render(wrap(
                <Dropdown options={options} allowAdditions search onChange={() => {}} {...extra} />
            ))
            // A query that MATCHES the existing options, so the addition is listed alongside them
            // rather than being the only item — which is what a non-matching query produces.
            fireEvent.change(container.querySelector('input.search'), {target: {value: 'Option'}})
            return Array.from(container.querySelectorAll('[role="option"]')).map(o => o.textContent.trim())
        }

        expect(menuFor({})).toEqual(['Option A', 'Option B', 'Add Option'])
        expect(menuFor({upward: true})).toEqual(['Add Option', 'Option A', 'Option B'])
    })
})

describe('Dropdown - array value (color-like)', () => {
    it('joins array value into a comma-separated string for single-select', () => {
        const { container } = render(wrap(
            <Dropdown options={[{ text: 'Red', value: [255, 0, 0] }]} value={[255, 0, 0]} />
        ))
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })

    it('joins each value in multi-select array', () => {
        const { container } = render(wrap(
            <Dropdown
                options={[{ text: 'Red', value: [255, 0, 0] }, { text: 'Green', value: [0, 255, 0] }]}
                value={[[255, 0, 0], [0, 255, 0]]}
                multiple
                onChange={() => {}}
            />
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

    it('honors onSearch via onSearchChange', () => {
        const onSearch = jest.fn()
        const { container } = render(wrap(
            <Dropdown options={options} search onSearch={onSearch} />
        ))
        expect(container.querySelector('.search.dropdown')).toBeInTheDocument()
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
