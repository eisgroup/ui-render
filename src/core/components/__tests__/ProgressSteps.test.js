import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProgressSteps from '../ProgressSteps'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

const items = [
    { step: '1', label: 'First', content: 'First content' },
    { step: '2', label: 'Second', content: 'Second content' },
    { step: '3', label: 'Third', done: true, content: 'Third content' },
    { step: '4', label: 'Fourth', error: true, content: 'Fourth content' },
]

describe('ProgressSteps', () => {
    it('renders all steps and labels', () => {
        const { container } = render(wrap(<ProgressSteps items={items} />))
        expect(container.textContent).toContain('First')
        expect(container.textContent).toContain('Second')
    })

    it('renders content for the active step', () => {
        const { container } = render(wrap(<ProgressSteps items={items} activeIndex={1} />))
        expect(container.textContent).toContain('Second content')
    })

    it('marks done steps with a checkmark', () => {
        const { container } = render(wrap(<ProgressSteps items={items} />))
        expect(container.querySelector('.icon-checkmark')).toBeInTheDocument()
    })

    it('marks error steps with a close icon', () => {
        const { container } = render(wrap(<ProgressSteps items={items} />))
        expect(container.querySelector('.icon-close')).toBeInTheDocument()
    })

    it('calls onChange with clicked step index', () => {
        const onChange = jest.fn()
        const { container } = render(wrap(<ProgressSteps items={items} onChange={onChange} />))
        const buttons = container.querySelectorAll('.app__progress__step button')
        act(() => {
            fireEvent.click(buttons[2])
            jest.advanceTimersByTime(100)
        })
        expect(onChange).toHaveBeenCalledWith(2)
    })

    it('shows ProgressBar between steps', () => {
        const { container } = render(wrap(<ProgressSteps items={items} activeIndex={2} />))
        expect(container.querySelectorAll('.app__progress--bar').length).toBeGreaterThan(0)
    })
})
