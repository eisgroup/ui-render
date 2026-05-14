import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import InputDate from '../InputDate'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

describe('InputDate', () => {
    it('renders the input-wrapper', () => {
        const { container } = render(wrap(<InputDate name="d" />))
        expect(container.querySelector('.input--wrapper')).toBeInTheDocument()
    })

    it('renders a label tied to id', () => {
        const { container } = render(wrap(<InputDate name="d" label="Date" id="date-1" />))
        const label = container.querySelector('label')
        expect(label).toHaveTextContent('Date')
        expect(label.getAttribute('for')).toBe('date-1')
    })

    it('derives id from label', () => {
        const { container } = render(wrap(<InputDate label="Birth Date" />))
        expect(container.querySelector('label').getAttribute('for')).toBe('input-Birth-Date')
    })

    it('renders error and info messages', () => {
        const { container } = render(
            wrap(<InputDate name="d" error="Required" info="Pick a date" />)
        )
        expect(container.textContent).toContain('Required')
        expect(container.textContent).toContain('Pick a date')
    })

    it('renders the rc-picker', () => {
        const { container } = render(wrap(<InputDate name="d" value="2024-01-15" />))
        expect(container.querySelector('.ui-render-picker')).toBeInTheDocument()
    })

    it('applies readonly class', () => {
        const { container } = render(wrap(<InputDate name="d" readonly />))
        // readonly sets className='readonly' on props (passed down to Picker)
        expect(container.querySelector('.readonly')).toBeInTheDocument()
    })

    it('renders children at the end', () => {
        const { container } = render(
            wrap(<InputDate name="d"><span data-testid="extra">x</span></InputDate>)
        )
        expect(container.querySelector('[data-testid="extra"]')).toBeInTheDocument()
    })
})
