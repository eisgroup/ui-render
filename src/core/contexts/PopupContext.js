import React from 'react'

export const PopupContext = React.createContext({
    isOpen: false,
    togglePopupState: () => {},
    title: '',
    content: '',
});
