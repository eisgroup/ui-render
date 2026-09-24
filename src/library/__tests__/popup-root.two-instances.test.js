/**
 * EACH MOUNTED DOCUMENT PORTALS ITS POPUP INTO ITS OWN SHELL (§9.3 step 3, risk R14).
 * =============================================================================================
 *
 * `AppWrapper` renders the popup root, and `Popup` used to find it with
 * `document.getElementById('render-popup-root')` — a document-wide lookup that returns the FIRST
 * match. Two mounted documents therefore put every popup inside the first one's subtree.
 *
 * That is not cosmetic. The shell carries the language and currency classes, so the second
 * document's popup rendered under the FIRST document's `lang--*` and currency; and unmounting the
 * first document would take the second one's open popup with it.
 *
 * The root is now handed down the existing `AppContext` as a NODE rather than looked up by id, so
 * each document portals into the element it rendered itself.
 */
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppWrapper from '../AppWrapper'
import Popup from '../../core/engine/components/Popup'
import { AppProvider } from '../../core/providers'
import { AppContext } from '../../core/contexts'

/**
 * Opens the popup once on mount, the way an action would.
 * @Note: `AppProvider` builds a new `setPopupState` on every render, so putting it in the
 *    dependency list re-runs this effect forever — it sets state, which re-renders the provider,
 *    which makes a new callback. Mount-only is what "open it once" means here anyway.
 */
const OpenPopup = ({ label }) => {
    const { setPopupState } = React.useContext(AppContext)
    const open = React.useRef(setPopupState)
    open.current = setPopupState
    React.useEffect(() => {
        open.current({ isOpen: true, title: label, content: label })
    }, [label])
    return <Popup/>
}

const documentNamed = label => (
    <AppProvider>
        <AppWrapper>
            <OpenPopup label={label}/>
        </AppWrapper>
    </AppProvider>
)

describe('two documents on one page keep their popups in their own shells', () => {
    it('puts each popup inside the shell that opened it', () => {
        const { container } = render(
            <div>
                <div data-testid="first">{documentNamed('A')}</div>
                <div data-testid="second">{documentNamed('B')}</div>
            </div>
        )

        const first = container.querySelector('[data-testid="first"]')
        const second = container.querySelector('[data-testid="second"]')

        // Asserted on the rendered text rather than a class name: the popup's own markup is not
        // what this contract is about, only which shell it ends up under.
        expect(first.textContent).toContain('A')
        expect(first.textContent).not.toContain('B')
        expect(second.textContent).toContain('B')
        expect(second.textContent).not.toContain('A')
    })

    it('keeps the popup under its own shell, so the shell classes apply to it', () => {
        const { container } = render(
            <div>
                <div data-testid="first">{documentNamed('A')}</div>
                <div data-testid="second">{documentNamed('B')}</div>
            </div>
        )

        // Every popup must sit under a `.ui-render` shell — the scoping prefix the whole stylesheet
        // is written against — and under the SECOND shell for the second document.
        const second = container.querySelector('[data-testid="second"]')
        const shells = second.querySelectorAll('.ui-render')
        expect(shells).toHaveLength(1)
        expect(second.textContent).toContain('B')
        expect(second.textContent).not.toContain('A')
    })
})
