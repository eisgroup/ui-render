import React from 'react'
import {
    ConfigContext,
    initialConfigState,
    AppContext,
    initialAppState,
} from '../contexts'

export const AppProvider = ({ children }) => {
    const [configState, setConfigState] = React.useState(initialConfigState)
    const [appState, setAppState] = React.useState(initialAppState)

    const setConfig = (newConfig) => {
        setConfigState((prevConfig) => ({
            ...prevConfig,
            ...newConfig,
        }))
    }

    const togglePopupState = () => {
        setAppState((prevState) => ({
            ...prevState,
            isOpen: !prevState.isOpen,
        }))
    }

    const setPopupState = (newState) => {
        const { title, content, isOpen } = newState
        setAppState((prevState) => ({
            ...prevState,
            title,
            content,
            isOpen: typeof isOpen === 'boolean' ? isOpen : prevState.isOpen
        }))
    }

    const setIsDataChangedListenerCalled = (isCalled) => {
        setAppState((prevState) => ({
            ...prevState,
            isDataChangedListenerCalled: isCalled,
        }))
    }

    return (
        <ConfigContext.Provider value={{...configState, setConfig}}>
            <AppContext.Provider value={{ ...appState, togglePopupState, setPopupState, setIsDataChangedListenerCalled }}>
                {children}
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
}
