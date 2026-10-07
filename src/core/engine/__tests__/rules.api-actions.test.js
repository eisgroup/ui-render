import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
// Load form registration before rules.tsx follows the mapper/renders cycle.
import UIRender from '../rules'
import { formsStorage } from '../../state/formRegistry'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'

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
        // The title is the error's MESSAGE, not the Error: the popup renders its title as it is,
        // and an object there replaced the whole UI with a React error (see `download.ts`).
        expect(popupState).toEqual(expect.objectContaining({
            isOpen: true,
            title: 'network unavailable',
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
        const [serialized, sentFile, sentFiles] = uploadFile.mock.calls[0]
        expect(serialized).toBe(JSON.stringify({ status: 'Before upload' }))
        // By identity: `toHaveBeenCalledWith` compares Files structurally, and any two are equal.
        expect(sentFile).toBe(file)
        expect(sentFiles).toEqual([file])
        expect(sentFiles[0]).toBe(file)
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
                                args: ['group-details'],
                            },
                        },
                        {
                            view: 'Popup',
                            id: 'group-details',
                            title: 'Group details',
                            items: [
                                { view: 'Text', children: 'Popup body' },
                            ],
                        },
                    ],
                }}
                data={{ recordNumber: 'P-100' }}
                initialValues={{ recordNumber: 'P-100' }}
            />
        ))

        fireEvent.click(screen.getByRole('button', { name: 'Open details' }))

        expect(popup.setPopupState).toHaveBeenCalledTimes(1)
        const popupState = popup.setPopupState.mock.calls[0][0]
        expect(popupState.title).toBe('Group details')
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
        const updateData = jest.fn().mockResolvedValue(response)
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
                apiCalls={{ updateData }}
            />,
            config
        ))

        const readFormData = getFormData.mock.calls[0][0]
        // Inside act: the host's promise settles into the document's update.
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Apply periods' }))
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        await waitFor(() => expect(screen.getByText('After apply')).toBeInTheDocument())
        expect(updateData).toHaveBeenCalledWith(initialValues)
        expect(screen.getByText('2026-07-31')).toBeInTheDocument()
        expect(readFormData()).toEqual({
            ...response,
            effectiveAt: '2026-07-31',
        })
    })

    it('still calls the host under the old name of `updateData`, and takes `updateData` when a host passes both', async () => {
        // `updateData` is the call's name since 2026-10-07. The old name is deprecated in the types and
        // keeps working, so no host has to change.
        const meta = { view: 'Button', children: 'Apply', onClick: { name: 'onApplyPeriods' } }
        const values = { status: 'Before' }
        const called = []
        const answering = name => data => {
            called.push([name, data])
            return Promise.resolve({ status: name })
        }
        const apply = () => act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        const old = render(withProviders(
            <UIRender form meta={meta} data={values} initialValues={values} apiCalls={{ updateExperienceData: answering('old') }} />
        ))
        await apply()
        old.unmount()
        render(withProviders(
            <UIRender form meta={meta} data={values} initialValues={values}
                apiCalls={{ updateData: answering('new'), updateExperienceData: answering('old') }} />
        ))
        await apply()

        expect(called).toEqual([['old', values], ['new', values]])
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
        const updateData = jest.fn().mockRejectedValue(failure)
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
                apiCalls={{ updateData }}
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
