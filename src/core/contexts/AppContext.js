import React from 'react'

export const initialAppState = {
    isDataChangedListenerCalled: false,
    setIsDataChangedListenerCalled: () => {},
    // Global popup state
    isOpen: false,
    togglePopupState: () => {},
    title: '',
    content: '',
    setPopupState: () => {},
}

export const AppContext = React.createContext(initialAppState);
