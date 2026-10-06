import React from 'react'
import { act, render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Modal from '../Modal'
import Listbox from '../../../components/Listbox'
import InputDate from '../../../components/InputDate'
import { AppContext } from '../../../contexts'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'

const wrap = (ui, appCtx) => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={appCtx}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

beforeEach(() => {
    // createPortal requires the target node to exist
    const root = document.createElement('div')
    root.id = 'render-popup-root'
    document.body.appendChild(root)
})

afterEach(() => {
    const root = document.getElementById('render-popup-root')
    if (root) document.body.removeChild(root)
})

describe('Modal', () => {
    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            wrap(<Modal />, { isOpen: false, togglePopupState: () => {} })
        )
        expect(container.firstChild).toBeNull()
        const root = document.getElementById('render-popup-root')
        expect(root.children.length).toBe(0)
    })

    it('renders title and string content into the portal when open', () => {
        const ctx = { isOpen: true, title: 'Hello', content: 'world', togglePopupState: () => {} }
        render(wrap(<Modal />, ctx))
        const root = document.getElementById('render-popup-root')
        expect(root.textContent).toContain('Hello')
        expect(root.textContent).toContain('world')
    })

    it('renders React element content as-is', () => {
        const ctx = {
            isOpen: true,
            title: 'X',
            content: <span data-testid="custom">custom</span>,
            togglePopupState: () => {},
        }
        render(wrap(<Modal />, ctx))
        expect(document.querySelector('[data-testid="custom"]')).toBeInTheDocument()
    })

    it('calls togglePopupState when the backdrop is clicked', () => {
        const togglePopupState = jest.fn()
        const ctx = { isOpen: true, title: 'X', content: 'y', togglePopupState }
        render(wrap(<Modal />, ctx))
        const backdrop = document.querySelector('.app__popup__backdrop')
        fireEvent.click(backdrop)
        expect(togglePopupState).toHaveBeenCalled()
    })

    it('calls togglePopupState when the OK button is clicked', () => {
        const togglePopupState = jest.fn()
        const ctx = { isOpen: true, title: 'X', content: 'y', togglePopupState }
        render(wrap(<Modal />, ctx))
        const button = document.querySelector('.app__popup__box__footer button')
        fireEvent.click(button)
        expect(togglePopupState).toHaveBeenCalled()
    })
})

// A modal dialog by the WAI-ARIA pattern since 2026-10-06. Before, it had no role, focus stayed on
// the control that opened it, Tab walked the page behind the backdrop, and Escape did nothing.
describe('Modal: the dialog a keyboard and a screen reader meet', () => {
    const open = (extra = {}) => ({ isOpen: true, title: 'Report', content: 'Saved.', togglePopupState: () => {}, ...extra })
    const dialog = () => document.querySelector('[role="dialog"]')
    const guards = () => document.querySelectorAll('#render-popup-root span[tabindex="0"]')

    it('is a modal dialog named by its title', () => {
        render(wrap(<Modal />, open()))
        expect(dialog()).toHaveAttribute('aria-modal', 'true')
        expect(document.getElementById(dialog().getAttribute('aria-labelledby'))).toHaveTextContent('Report')
    })

    it('carries no name it does not have', () => {
        render(wrap(<Modal />, open({ title: '' })))
        expect(dialog()).not.toHaveAttribute('aria-labelledby')
    })

    it('moves focus to its first control, which is Ok when the content has none', () => {
        const { unmount } = render(wrap(<Modal />, open()))
        expect(document.activeElement).toHaveTextContent('Ok')
        unmount()

        render(wrap(<Modal />, open({ content: <input aria-label="first" /> })))
        expect(document.activeElement).toBe(document.querySelector('input[aria-label="first"]'))
    })

    it('keeps Tab and Shift+Tab inside: past the last control is the first, before the first is the last', () => {
        render(wrap(<Modal />, open({ content: <input aria-label="first" /> })))
        const [before, after] = guards()

        after.focus()
        expect(document.activeElement).toBe(document.querySelector('input[aria-label="first"]'))
        before.focus()
        expect(document.activeElement).toHaveTextContent('Ok')
    })

    it('closes on Escape, unless a control inside it used the key', () => {
        let closed = 0
        const togglePopupState = () => { closed += 1 }
        const claims = event => { if (event.key === 'Escape') event.preventDefault() }
        render(wrap(<Modal />, open({ togglePopupState, content: <input aria-label="claims" onKeyDown={claims} /> })))

        fireEvent.keyDown(document.querySelector('input[aria-label="claims"]'), { key: 'Escape' })
        expect(closed).toBe(0)
        fireEvent.keyDown(document.querySelector('.app__popup__box__footer button'), { key: 'Escape' })
        expect(closed).toBe(1)
    })

    it('leaves an Escape to an open listbox inside it: the list closes, the dialog stays', () => {
        let closed = 0
        const options = [{ text: 'Alpha', value: 'a' }, { text: 'Beta', value: 'b' }]
        render(wrap(<Modal />, open({
            togglePopupState: () => { closed += 1 },
            content: <Listbox options={options} onChange={() => {}} />,
        })))
        const combobox = document.querySelector('[role="combobox"]')
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        expect(combobox).toHaveAttribute('aria-expanded', 'true')

        fireEvent.keyDown(combobox, { key: 'Escape' })
        expect(combobox).toHaveAttribute('aria-expanded', 'false')
        expect(closed).toBe(0)
        fireEvent.keyDown(combobox, { key: 'Escape' })
        expect(closed).toBe(1)
    })

    it('leaves an Escape to an open calendar, which rc-picker does not claim and mounts outside it', () => {
        // rc-picker animates the calendar in and out with timers, and React 16, 17 and 19 report each
        // step that lands outside `act`: every interaction and every flush below is inside one, and the
        // view unmounts before the real timers come back.
        jest.useFakeTimers()
        try {
            let closed = 0
            const view = render(wrap(<Modal />, open({
                togglePopupState: () => { closed += 1 },
                content: <InputDate name="day" value="2022-01-01" onChange={() => {}} />,
            })))
            const input = document.querySelector('.ui-render-picker input')
            const calendar = () => document.querySelector('.ui-render-picker-dropdown')
            act(() => { fireEvent.mouseDown(input); fireEvent.click(input) })
            act(() => { jest.runAllTimers() })
            expect(calendar()).not.toHaveClass('ui-render-picker-dropdown-hidden')

            act(() => { fireEvent.keyDown(input, { key: 'Escape' }) })
            act(() => { jest.runAllTimers() })
            expect(calendar()).toHaveClass('ui-render-picker-dropdown-hidden')
            expect(closed).toBe(0)
            act(() => { fireEvent.keyDown(input, { key: 'Escape' }) })
            expect(closed).toBe(1)

            view.unmount()
            act(() => { jest.runAllTimers() })
        } finally {
            jest.useRealTimers()
        }
    })

    it('gives focus back to the control that opened it', () => {
        const Page = ({ isOpen }) => (
            <>
                <button type="button">Open</button>
                {wrap(<Modal />, open({ isOpen }))}
            </>
        )
        const { rerender } = render(<Page isOpen={false} />)
        const opener = document.querySelector('button')
        opener.focus()

        rerender(<Page isOpen />)
        expect(document.activeElement).not.toBe(opener)
        rerender(<Page isOpen={false} />)
        expect(document.activeElement).toBe(opener)
    })
})
