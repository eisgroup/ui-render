import React, { useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../../components/Button'
import Text from '../../components/Text'
import View from '../../components/View'
import { l, localiseTranslation } from '../../utils'
import { _ } from '../../utils/translations'
import { AppContext } from '../../contexts'

localiseTranslation({
    CANCEL: {
        [l.ENGLISH]: 'Cancel',
    },
    CONFIRM: {
        [l.ENGLISH]: 'Confirm',
    },
    CONFIRM_ACTION: {
        [l.ENGLISH]: 'Confirm Action',
    },
    ERROR_excMark: {
        [l.ENGLISH]: 'Error!',
    },
    POPUP: {
        [l.ENGLISH]: 'Popup',
    },
})

/** What sequential focus navigation may stop at; `focus()` itself rules out the rest (hidden, inert). */
const TABBABLE = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, iframe, summary,'
    + ' [contenteditable=""], [contenteditable="true"], [tabindex]'

/** The controls inside `element`, in document order. */
const controlsOf = (element: HTMLElement | null): HTMLElement[] => element
    ? Array.from(element.querySelectorAll<HTMLElement>(TABBABLE))
    : []

/** Focuses the first of `candidates` that takes focus, and says whether one did. */
const focusFirstOf = (candidates: HTMLElement[]): boolean => candidates.some((element) => {
    if (element.tabIndex < 0 || (element as HTMLButtonElement).disabled) return false
    element.focus()
    return document.activeElement === element
})

/**
 * The focus guards either side of the dialog: Tab past its last control lands on the one after it,
 * Shift+Tab before its first on the one before it, and each sends focus back in. Out of the flow,
 * so the popup's layout is what it was without them.
 */
const GUARD_STYLE: React.CSSProperties = { position: 'fixed', top: 1, left: 1, width: 1, height: 0, padding: 0, overflow: 'hidden' }

/** Ids for the dialog's title and message: a document has one popup, a page may hold several documents. */
let popups = 0

/**
 * The document's modal. It shows what a `popupOpen` action opened: the content a `view: 'Popup'`
 * node registered, or a message. Named `Popup` until §9.9-H6; the meta, the actions and the
 * classes keep that name.
 *
 * A dialog by the WAI-ARIA modal dialog pattern since 2026-10-06. The box is `role="dialog"` with
 * `aria-modal`, named by its title, or by its message or "Popup" when it has none. Opening it moves
 * focus to its first control, which is its Ok button when the content has none; Tab and Shift+Tab
 * stay inside it; Escape closes it, as the backdrop and Ok do; and closing it gives focus back to
 * what had it, the control that opened it.
 * Before, focus stayed on that control behind the backdrop, Tab walked the page under it, and only
 * the pointer could close it (`e2e/interactive-views.pw.js` measured each).
 */
const Modal = () => {
    const popup = useContext(AppContext)
    const { isOpen, title, content, togglePopupState } = popup
    const activeClass = isOpen ? ' active' : ''
    const box = useRef<HTMLDivElement>(null)
    const [{ titleId, messageId }] = useState(() => {
        popups += 1
        return { titleId: `app__popup__title-${popups}`, messageId: `app__popup__message-${popups}` }
    })
    // A dialog must have a name: its title; else the message it shows, when that is text; else a word for
    // itself. Until 2026-10-06 a popup with no title had none.
    const name = title
        ? { 'aria-labelledby': titleId }
        : (typeof content === 'string' && content ? { 'aria-labelledby': messageId } : { 'aria-label': _.POPUP })

    useEffect(() => {
        if (!isOpen) return undefined
        const opener = document.activeElement as HTMLElement | null
        focusFirstOf(controlsOf(box.current))
        return () => {
            // On close, and on an unmount while open. Not to `<body>`: nothing had focus then.
            if (opener && opener !== document.body && opener.isConnected) opener.focus()
        }
    }, [isOpen])

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // A control inside that used the key claims it: an open listbox closes on Escape and says so.
        if (event.key !== 'Escape' || event.defaultPrevented) return
        // rc-picker closes its calendar on Escape without claiming the key, and the calendar lives
        // outside the dialog, in `<body>`: while one is open, this Escape is the calendar's.
        if (document.querySelector('.ui-render-picker-dropdown:not(.ui-render-picker-dropdown-hidden)')) return
        event.preventDefault()
        togglePopupState()
    }

    if (!isOpen) return null

    return createPortal(
            <View
                className={'app__popup' + activeClass}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
            >
                <View
                    className="app__popup__backdrop no-outline"
                    onClick={togglePopupState}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                />
                <span tabIndex={0} style={GUARD_STYLE} onFocus={() => { focusFirstOf(controlsOf(box.current).reverse()) }}/>
                <div
                    ref={box}
                    role="dialog"
                    aria-modal="true"
                    {...name}
                    className={'flex--col app__popup__box zoomin'}
                    onKeyDown={onKeyDown}
                    style={{
                        position: 'relative',
                        zIndex: 1001,
                        maxWidth: '90%',
                        maxHeight: '90%',
                        overflow: 'auto',
                        marginTop: 0
                    }}
                >
                    <View className="app__popup__box__content">
                        {isOpen && (
                            <>
                                <View className="app__popup__box__header">
                                    <Text id={titleId} className="app__popup__box__header__title">{title}</Text>
                                </View>
                                <View className="app__popup__box__body">
                                    {typeof content === 'string' ? <Text id={messageId}
                                        className="p center">{content}</Text> : content}
                                </View>
                                <View className="app__popup__box__footer center">
                                    <Button onClick={togglePopupState} className="primary">{_.OK}</Button>
                                </View>
                            </>
                        )}
                    </View>
                </div>
                <span tabIndex={0} style={GUARD_STYLE} onFocus={() => { focusFirstOf(controlsOf(box.current)) }}/>
            </View>,
            // This document's own root when a shell published one; otherwise the id, which is
            // how the demo and the test harnesses provide it. Not null: one of the two is always
            // there, and without either `createPortal` throws, as it did.
            (popup.popupRoot || document.getElementById('render-popup-root'))!
        )
}

    export default Modal
