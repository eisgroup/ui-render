import React from 'react'

export const initialPopupState = {
    isOpen: false,
    togglePopupState: () => {},
    title: '',
    content: '',
    setPopupState: () => {},
}

export const PopupContext = React.createContext(initialPopupState);
