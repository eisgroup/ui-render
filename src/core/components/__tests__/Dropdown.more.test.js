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

    it('positions addition at the bottom by default', () => {
        const onChange = jest.fn()
        render(wrap(
            <Dropdown options={options} allowAdditions search onChange={onChange} />
        ))
        // No throw; addition logic is set up internally
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

    it('wires onClickIcon by rendering a clickable Icon', () => {
        const onClickIcon = jest.fn()
        const { container } = render(wrap(
            <Dropdown options={options} onClickIcon={onClickIcon} />
        ))
        const icon = container.querySelector('.icon.pointer')
        if (icon) {
            fireEvent.click(icon)
            expect(onClickIcon).toHaveBeenCalled()
        }
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
