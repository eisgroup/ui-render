import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Popup from '../Popup'
import { AppContext } from '../../../../contexts'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'

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

describe('Popup', () => {
    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            wrap(<Popup />, { isOpen: false, togglePopupState: () => {} })
        )
        expect(container.firstChild).toBeNull()
        const root = document.getElementById('render-popup-root')
        expect(root.children.length).toBe(0)
    })

    it('renders title and string content into the portal when open', () => {
        const ctx = { isOpen: true, title: 'Hello', content: 'world', togglePopupState: () => {} }
        render(wrap(<Popup />, ctx))
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
        render(wrap(<Popup />, ctx))
        expect(document.querySelector('[data-testid="custom"]')).toBeInTheDocument()
    })

    it('calls togglePopupState when the backdrop is clicked', () => {
        const togglePopupState = jest.fn()
        const ctx = { isOpen: true, title: 'X', content: 'y', togglePopupState }
        render(wrap(<Popup />, ctx))
        const backdrop = document.querySelector('.app__popup__backdrop')
        fireEvent.click(backdrop)
        expect(togglePopupState).toHaveBeenCalled()
    })

    it('calls togglePopupState when the OK button is clicked', () => {
        const togglePopupState = jest.fn()
        const ctx = { isOpen: true, title: 'X', content: 'y', togglePopupState }
        render(wrap(<Popup />, ctx))
        const button = document.querySelector('.app__popup__box__footer button')
        fireEvent.click(button)
        expect(togglePopupState).toHaveBeenCalled()
    })
})
