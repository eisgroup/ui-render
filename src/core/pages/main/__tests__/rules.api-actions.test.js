// rules.js registers fetch while building the action map.
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}

import React from 'react' // eslint-disable-line import/first
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
// Load form registration before rules.js follows the mapper/renders cycle.
import { storedTouched } from '../../../modules/form/utils' // eslint-disable-line import/first
import UIRender, { clearErrorsMap, formsStorage } from '../rules' // eslint-disable-line import/first
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../../contexts' // eslint-disable-line import/first

const popup = {
    ...initialAppState,
    setPopupState: jest.fn(),
}

const withProviders = (ui, config = initialConfigState) => (
    <ConfigContext.Provider value={config}>
        <AppContext.Provider value={popup}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

const originalResponse = global.Response

afterEach(() => {
    cleanup()
    formsStorage.clear()
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
    popup.setPopupState.mockClear()
    jest.restoreAllMocks()
    if (originalResponse === undefined) {
        delete global.Response
    } else {
        global.Response = originalResponse
    }
})

describe('UIRender additional action and error contracts', () => {
    it('turns a failed download into the documented popup error', async () => {
        const failure = new Error('network unavailable')
        const downloadFile = jest.fn().mockRejectedValue(failure)

        render(withProviders(
            <UIRender
                meta={{
                    view: 'Button',
                    children: 'Download rates',
                    onClick: {
                        name: 'download',
                        args: ['rates.csv'],
                    },
                }}
                data={{ requestId: 'request-1' }}
                apiCalls={{ downloadFile }}
            />
        ))

        fireEvent.click(screen.getByRole('button', { name: 'Download rates' }))

        await waitFor(() => expect(popup.setPopupState).toHaveBeenCalledTimes(1))
        expect(downloadFile).toHaveBeenCalledWith('rates.csv')
        const popupState = popup.setPopupState.mock.calls[0][0]
        expect(popupState).toEqual(expect.objectContaining({
            isOpen: true,
            title: failure,
        }))
        expect(React.isValidElement(popupState.content)).toBe(true)
        expect(popupState.content.props.data).toBe('Download Failed!')
    })

    it('keeps current data and reports the original upload failure', async () => {
        const failure = new Error('upload rejected')
        const uploadFile = jest.fn().mockRejectedValue(failure)
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        const data = {
            status: 'Before upload',
            file: 'stale.csv',
        }
        const { container } = render(withProviders(
            <UIRender
                form
                meta={{
                    view: 'Row',
                    items: [
                        { view: 'Text', children: { name: 'status' } },
                        {
                            view: 'Input',
                            name: 'file',
                            type: 'file',
                            formats: ['csv'],
                            multiple: false,
                            onChange: 'upload',
                        },
                    ],
                }}
                data={data}
                initialValues={data}
                apiCalls={{ uploadFile }}
            />
        ))

        const file = new File(['a,b\n1,2'], 'replacement.csv', { type: 'text/csv' })
        fireEvent.change(container.querySelector('input[type="file"]'), {
            target: { files: [file] },
        })

        await waitFor(() => expect(consoleError).toHaveBeenCalledWith(failure))
        expect(uploadFile).toHaveBeenCalledWith(
            JSON.stringify({ status: 'Before upload' }),
            file
        )
        expect(screen.getByText('Before upload')).toBeInTheDocument()
        expect(popup.setPopupState).not.toHaveBeenCalled()
    })

    it('opens a registered static popup and preserves its rendered content', () => {
        render(withProviders(
            <UIRender
                form
                meta={{
                    view: 'Row',
                    items: [
                        {
                            view: 'Button',
                            children: 'Open details',
                            onClick: {
                                name: 'popupOpen',
                                args: ['policy-details'],
                            },
                        },
                        {
                            view: 'Popup',
                            id: 'policy-details',
                            title: 'Policy details',
                            items: [
                                { view: 'Text', children: 'Popup body' },
                            ],
                        },
                    ],
                }}
                data={{ policyNumber: 'P-100' }}
                initialValues={{ policyNumber: 'P-100' }}
            />
        ))

        fireEvent.click(screen.getByRole('button', { name: 'Open details' }))

        expect(popup.setPopupState).toHaveBeenCalledTimes(1)
        const popupState = popup.setPopupState.mock.calls[0][0]
        expect(popupState.title).toBe('Policy details')
        expect(React.isValidElement(popupState.content)).toBe(true)

        render(withProviders(popupState.content))
        expect(screen.getByText('Popup body')).toBeInTheDocument()
    })

    it('applies an API response, normalizes dates, and restarts form data', async () => {
        const getFormData = jest.fn()
        const initialValues = {
            status: 'Before apply',
            requestId: 'request-2',
        }
        const response = {
            status: 'After apply',
            effectiveAt: '2026-07-31T22:15:00.000Z',
            requestId: 'request-2',
        }
        const updateExperienceData = jest.fn().mockResolvedValue(response)
        const config = {
            ...initialConfigState,
            dateFormat: 'YYYY-MM-DD',
        }
        render(withProviders(
            <UIRender
                form
                meta={{
                    view: 'Row',
                    items: [
                        { view: 'Text', children: { name: 'status' } },
                        { view: 'Text', children: { name: 'effectiveAt' } },
                        {
                            view: 'Button',
                            children: 'Apply periods',
                            onClick: { name: 'onApplyPeriods' },
                        },
                    ],
                }}
                data={initialValues}
                initialValues={initialValues}
                getFormData={getFormData}
                apiCalls={{ updateExperienceData }}
            />,
            config
        ))

        const readFormData = getFormData.mock.calls[0][0]
        fireEvent.click(screen.getByRole('button', { name: 'Apply periods' }))

        await waitFor(() => expect(screen.getByText('After apply')).toBeInTheDocument())
        expect(updateExperienceData).toHaveBeenCalledWith(initialValues)
        expect(screen.getByText('2026-07-31')).toBeInTheDocument()
        expect(readFormData()).toEqual({
            ...response,
            effectiveAt: '2026-07-31',
        })
    })

    it('extracts a backend message from a failed apply Response', async () => {
        class ResponseStub {
            constructor (body) {
                this.body = body
            }

            text = jest.fn(async () => this.body)
        }

        global.Response = ResponseStub
        const failure = new ResponseStub(JSON.stringify({
            message: 'message=Periods overlap errors=[]',
        }))
        const updateExperienceData = jest.fn().mockRejectedValue(failure)
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

        render(withProviders(
            <UIRender
                form
                meta={{
                    view: 'Button',
                    children: 'Apply invalid periods',
                    onClick: { name: 'onApplyPeriods' },
                }}
                data={{ status: 'Before apply', requestId: 'request-3' }}
                initialValues={{ status: 'Before apply', requestId: 'request-3' }}
                apiCalls={{ updateExperienceData }}
            />
        ))

        fireEvent.click(screen.getByRole('button', { name: 'Apply invalid periods' }))

        await waitFor(() => expect(popup.setPopupState).toHaveBeenCalledTimes(1))
        expect(failure.text).toHaveBeenCalledTimes(1)
        const popupState = popup.setPopupState.mock.calls[0][0]
        expect(popupState.title).toBe('Error')
        expect(React.isValidElement(popupState.content)).toBe(true)
        expect(popupState.content.props.data.message.trim()).toBe('Periods overlap')
        expect(consoleError).toHaveBeenCalledWith(failure)
    })
})
