import React from 'react'
import { act, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProgressBar from '../ProgressBar'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('ProgressBar', () => {
    it('renders the progress wrapper', () => {
        const { container } = render(wrap(<ProgressBar value={0.5} />))
        expect(container.querySelector('.app__progress--bar')).toBeInTheDocument()
    })

    it('sets the inner bar width based on value after mount', () => {
        const { container } = render(wrap(<ProgressBar value={0.4} />))
        act(() => { jest.runAllTimers() })
        const bar = container.querySelector('.app__progress__bar')
        expect(bar.style.width).toBe('40%')
    })

    it('applies gradient class by default', () => {
        const { container } = render(wrap(<ProgressBar value={0.5} />))
        expect(container.querySelector('.app__progress--bar').className).toContain('gradient')
    })

    it('hides gradient class when gradient=false', () => {
        const { container } = render(wrap(<ProgressBar value={0.5} gradient={false} />))
        expect(container.querySelector('.app__progress--bar').className).not.toContain('gradient')
    })

    it('renders the label inside the bar', () => {
        const { container } = render(wrap(<ProgressBar value={0.5} label="Loading" />))
        act(() => { jest.runAllTimers() })
        expect(container.textContent).toContain('Loading')
    })

    it('renders a tooltip when hasTooltip is true', () => {
        const { container } = render(wrap(<ProgressBar value={0.5} hasTooltip />))
        act(() => { jest.runAllTimers() })
        expect(container.querySelector('.app__progress__bar__tooltip')).toBeInTheDocument()
    })

    it('applies custom backgroundColor when color prop is set', () => {
        const { container } = render(wrap(<ProgressBar value={0.5} color="red" />))
        act(() => { jest.runAllTimers() })
        expect(container.querySelector('.app__progress__bar').style.backgroundColor).toBe('red')
    })
})
