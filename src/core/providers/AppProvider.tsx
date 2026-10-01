import React from 'react'
import {
    ConfigContext,
    initialConfigState,
    AppContext,
    initialAppState,
} from '../contexts'
import type { ConfigState, PopupState } from '../contexts'

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
    const [configState, setConfigState] = React.useState(initialConfigState)
    const [appState, setAppState] = React.useState(initialAppState)

    const setConfig: ConfigState['setConfig'] = (newConfig) => {
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

    const setPopupState = (newState: PopupState) => {
        const { title, content, isOpen } = newState
        setAppState((prevState) => ({
            ...prevState,
            title,
            content,
            isOpen: typeof isOpen === 'boolean' ? isOpen : prevState.isOpen
        }))
    }

    return (
        <ConfigContext.Provider value={{...configState, setConfig}}>
            <AppContext.Provider value={{ ...appState, togglePopupState, setPopupState }}>
                {children}
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
}
