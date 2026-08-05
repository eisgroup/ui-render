import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppContext, ConfigContext } from '../../contexts'
import { AppProvider } from '../AppProvider'

const ContextHarness = () => {
    const config = React.useContext(ConfigContext)
    const app = React.useContext(AppContext)

    return (
        <div>
            <output data-testid="config">
                {`${config.dateFormat}|${config.currency}|${config.language}`}
            </output>
            <output data-testid="popup">
                {`${app.isOpen}|${app.title}|${app.content}`}
            </output>
            <button
                type="button"
                onClick={() => config.setConfig({ currency: 'EUR', language: 'pl' })}
            >
                configure
            </button>
            <button
                type="button"
                onClick={() => app.setPopupState({
                    title: 'Confirmation',
                    content: 'Continue?',
                    isOpen: true,
                })}
            >
                open popup
            </button>
            <button type="button" onClick={app.togglePopupState}>toggle popup</button>
            <button
                type="button"
                onClick={() => app.setPopupState({ title: 'Updated', content: 'Saved' })}
            >
                update popup
            </button>
            <button
                type="button"
                onClick={() => {
                    app.togglePopupState()
                    app.togglePopupState()
                }}
            >
                toggle twice
            </button>
        </div>
    )
}

describe('AppProvider contracts', () => {
    it('exposes the initial configuration and popup state to descendants', () => {
        render(
            <AppProvider>
                <ContextHarness />
            </AppProvider>
        )

        expect(screen.getByTestId('config')).toHaveTextContent('MM-DD-YYYY|USD|en')
        expect(screen.getByTestId('popup')).toHaveTextContent('false||')
    })

    it('merges partial configuration without discarding existing defaults', () => {
        render(
            <AppProvider>
                <ContextHarness />
            </AppProvider>
        )

        fireEvent.click(screen.getByRole('button', { name: 'configure' }))

        expect(screen.getByTestId('config')).toHaveTextContent('MM-DD-YYYY|EUR|pl')
    })

    it('opens, updates, and toggles popup state without losing its payload', () => {
        render(
            <AppProvider>
                <ContextHarness />
            </AppProvider>
        )

        fireEvent.click(screen.getByRole('button', { name: 'open popup' }))
        expect(screen.getByTestId('popup')).toHaveTextContent('true|Confirmation|Continue?')

        fireEvent.click(screen.getByRole('button', { name: 'toggle popup' }))
        expect(screen.getByTestId('popup')).toHaveTextContent('false|Confirmation|Continue?')

        fireEvent.click(screen.getByRole('button', { name: 'update popup' }))
        expect(screen.getByTestId('popup')).toHaveTextContent('false|Updated|Saved')
    })

    it('uses functional popup updates when multiple toggles are batched', () => {
        render(
            <AppProvider>
                <ContextHarness />
            </AppProvider>
        )

        fireEvent.click(screen.getByRole('button', { name: 'toggle twice' }))

        expect(screen.getByTestId('popup')).toHaveTextContent('false||')
    })
})
