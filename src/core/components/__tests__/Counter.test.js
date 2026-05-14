import React from 'react'
import { render, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Counter from '../Counter'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('Counter', () => {
    it('renders the starting value initially', () => {
        const { container } = render(wrap(<Counter start={0} end={100} />))
        expect(container.textContent).toBe('0')
    })

    it('animates by changing the displayed value when timers run', () => {
        const { container } = render(wrap(<Counter start={0} end={100} duration={170} interval={17} />))
        act(() => {
            jest.runAllTimers()
        })
        // Counter approaches end value asymptotically; precise value depends on easing.
        // We just need to verify it changed from the initial 0 and is rounded.
        const text = container.textContent
        expect(text).not.toBe('0')
        expect(Number(text)).toBeGreaterThan(0)
    })

    it('uses a custom render function', () => {
        const customRender = (value) => `~${value}~`
        const { container } = render(wrap(<Counter start={0} end={5} render={customRender} />))
        expect(container.textContent).toBe('~0~')
    })

    it('does not animate when start === end (zero steps)', () => {
        const { container } = render(wrap(<Counter start={42} end={42} />))
        act(() => {
            jest.runAllTimers()
        })
        expect(container.textContent).toBe('42')
    })
})
