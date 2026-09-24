import React from 'react'

export const initialAppState = {
    // Global popup state
    isOpen: false,
    togglePopupState: () => {},
    title: '',
    content: '',
    setPopupState: () => {},
    // The element this document's popup portals into. A NODE, not an id: every mounted document
    // renders a popup root of its own, and a document-wide `getElementById` hands them all to
    // whichever is first in the DOM. Null when nothing published one — `Popup` then falls back to
    // the id, which is how the demo and the test harnesses supply a root.
    popupRoot: null,
}

export const AppContext = React.createContext(initialAppState);
