import React from 'react'

import { ConfigContext, initialConfigState, PopupContext, initialPopupState} from '../contexts'

export const AppProvider = ({ children }) => {
    const [configState, setConfigState] = React.useState(initialConfigState)
    const [popupState, setPopupState] = React.useState(initialPopupState)

    const setConfig = (newConfig) => {
        setConfigState((prevConfig) => ({
            ...prevConfig,
            ...newConfig,
        }))
    }

    const togglePopupState = () => {
        setPopupState((prevState) => ({
            ...prevState,
            isOpen: !prevState.isOpen,
        }))
    }

    return (
        <ConfigContext.Provider value={{...configState, setConfig}}>
            <PopupContext.Provider value={{ ...popupState, togglePopupState, setPopupState }}>
                {children}
            </PopupContext.Provider>
        </ConfigContext.Provider>
    )
}
