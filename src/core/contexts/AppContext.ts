import React from 'react'

/** What a popup is opened with; `isOpen` left out keeps the popup as it is. */
export type PopupState = { title?: React.ReactNode, content?: React.ReactNode, isOpen?: boolean }

/** The popup a document shows, the calls that change it, and where it portals to. */
export type AppState = {
    isOpen: boolean
    togglePopupState: () => void
    title: React.ReactNode
    content: React.ReactNode
    setPopupState: (popup: PopupState) => void
    popupRoot: HTMLElement | null
}

export const initialAppState: AppState = {
    // Global popup state
    isOpen: false,
    togglePopupState: () => {},
    title: '',
    content: '',
    setPopupState: () => {},
    // The element this document's popup portals into. A NODE, not an id: every mounted document
    // renders a popup root of its own, and a document-wide `getElementById` hands them all to
    // whichever is first in the DOM. Null when nothing published one — `Modal` then falls back to
    // the id, which is how the demo and the test harnesses supply a root.
    popupRoot: null,
}

export const AppContext = React.createContext(initialAppState);
