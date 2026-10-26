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

    // Made once: each changes its state with an updater, so none reads the state of a render.
    const setConfig = React.useCallback<ConfigState['setConfig']>((newConfig) => {
        setConfigState((prevConfig) => ({
            ...prevConfig,
            ...newConfig,
        }))
    }, [])

    const togglePopupState = React.useCallback(() => {
        setAppState((prevState) => ({
            ...prevState,
            isOpen: !prevState.isOpen,
        }))
    }, [])

    const setPopupState = React.useCallback((newState: PopupState) => {
        const { title, content, isOpen } = newState
        setAppState((prevState) => ({
            ...prevState,
            title,
            content,
            isOpen: typeof isOpen === 'boolean' ? isOpen : prevState.isOpen
        }))
    }, [])

    // A value is made again only when its state changes. Until 2026-10-23 both were new on every render, so
    // whenever the host rendered, every component that reads either context rendered again: every `Text`, and
    // every node of the document. That was all that reached the texts a `Text` shows when the host switched
    // language, and nothing reached the rest (`translate` in `engine/rules.tsx` does now).
    const config = React.useMemo(() => ({ ...configState, setConfig }), [configState, setConfig])
    const app = React.useMemo(
        () => ({ ...appState, togglePopupState, setPopupState }),
        [appState, togglePopupState, setPopupState],
    )

    return (
        <ConfigContext.Provider value={config}>
            <AppContext.Provider value={app}>
                {children}
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
}
