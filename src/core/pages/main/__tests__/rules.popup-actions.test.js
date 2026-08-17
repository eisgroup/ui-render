// rules.js registers fetch while building the action map.
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}

import React from 'react' // eslint-disable-line import/first
import { cleanup, fireEvent, render, screen } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import { storedTouched } from '../../../modules/form/utils' // eslint-disable-line import/first
import UIRender, { clearErrorsMap, formsStorage } from '../rules' // eslint-disable-line import/first
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../../contexts' // eslint-disable-line import/first

const appContext = {
    ...initialAppState,
    setPopupState: jest.fn(),
}
let consoleError
let consoleWarn

const withProviders = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={appContext}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

function renderPopupButton ({ action, popupId = 'contract-popup', title = 'Contract popup' }) {
    return render(withProviders(
        <UIRender
            meta={{
                view: 'Row',
                items: [
                    {
                        view: 'Button',
                        children: 'Open contract popup',
                        onClick: action,
                    },
                    {
                        view: 'Popup',
                        id: popupId,
                        title,
                        items: [{ view: 'Text', children: 'Popup content' }],
                    },
                ],
            }}
            data={{ requestId: 'popup-contract' }}
        />
    ))
}

beforeEach(() => {
    // Existing renderer props produce development-only React warnings unrelated to this contract.
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
    cleanup()
    formsStorage.clear()
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
    appContext.setPopupState.mockClear()
    jest.restoreAllMocks()
})

describe('UIRender popup action argument contracts', () => {
    it('filters the click event and React component class before declarative arguments', () => {
        class CallerComponent extends React.Component {
            render () {
                return null
            }
        }

        renderPopupButton({
            action: {
                name: 'popupOpen',
                args: [CallerComponent, 'contract-popup'],
            },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Open contract popup' }))

        expect(appContext.setPopupState).toHaveBeenCalledTimes(1)
        expect(appContext.setPopupState.mock.calls[0][0]).toEqual(expect.objectContaining({
            isOpen: true,
            title: 'Contract popup',
        }))
    })

    it('accepts an options object carrying the popup id', () => {
        renderPopupButton({
            action: {
                name: 'popupOpen',
                args: [{ id: 'contract-popup', relativeIndex: 3 }],
            },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Open contract popup' }))

        expect(appContext.setPopupState).toHaveBeenCalledTimes(1)
        expect(appContext.setPopupState.mock.calls[0][0].title).toBe('Contract popup')
    })

    it('normalizes a numeric popup id before lookup', () => {
        renderPopupButton({
            popupId: '7',
            title: 'Numeric popup',
            action: { name: 'popupOpen', args: [7] },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Open contract popup' }))

        expect(appContext.setPopupState).toHaveBeenCalledTimes(1)
        expect(appContext.setPopupState.mock.calls[0][0].title).toBe('Numeric popup')
    })

    it('rejects an action containing only the click event without opening a popup', () => {
        renderPopupButton({ action: { name: 'popupOpen' } })
        consoleError.mockClear()

        fireEvent.click(screen.getByRole('button', { name: 'Open contract popup' }))

        expect(consoleError).toHaveBeenCalledWith(
            'Popup Open: no arguments provided after filtering'
        )
        expect(appContext.setPopupState).not.toHaveBeenCalled()
    })

    it('rejects an options object without a usable id', () => {
        renderPopupButton({
            action: { name: 'popupOpen', args: [{ relativeIndex: 1 }] },
        })
        consoleError.mockClear()

        fireEvent.click(screen.getByRole('button', { name: 'Open contract popup' }))

        expect(consoleError).toHaveBeenCalledWith(
            'Popup Open: id must be a non-empty string, got:',
            'undefined',
            undefined
        )
        expect(appContext.setPopupState).not.toHaveBeenCalled()
    })

    // The row-extraction branch reads currentRelativePath, which is declared further down the same block.
    // With an interpolated template whose local data is the row array, that read is reached and throws
    // ReferenceError from the temporal dead zone instead of opening the popup.
    it('opens an interpolated popup template whose local data is the row array', () => {
        render(withProviders(
            <UIRender
                meta={{
                    view: 'Row',
                    items: [
                        {
                            view: 'Button',
                            children: 'Open row popup',
                            onClick: { name: 'popupOpen', args: ['row.0'] },
                        },
                        {
                            view: 'Popup',
                            id: 'row.{index}',
                            name: 'rows',
                            title: 'Row popup',
                            items: [{ view: 'Text', children: 'Popup content' }],
                        },
                    ],
                }}
                data={{ rows: [{ label: 'first' }, { label: 'second' }] }}
            />
        ))

        fireEvent.click(screen.getByRole('button', { name: 'Open row popup' }))

        expect(appContext.setPopupState).toHaveBeenCalledTimes(1)
        expect(appContext.setPopupState.mock.calls[0][0]).toEqual(expect.objectContaining({
            isOpen: true,
            title: 'Row popup',
        }))
        // This popup carries a row index but no scope, which is exactly the case the engine used to
        // guess at. It now says so instead, naming the popup that needs the meta fixed.
        expect(consoleWarn).toHaveBeenCalledWith(
            expect.stringContaining('POPUP_OPEN: "row.0" opened for row index 0 without a relativePath')
        )
    })
})
