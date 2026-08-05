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

const appContext = {
    ...initialAppState,
    setPopupState: jest.fn(),
}

const withProviders = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={appContext}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

const originalResponse = global.Response

afterEach(() => {
    cleanup()
    formsStorage.clear()
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
    appContext.setPopupState.mockClear()
    jest.restoreAllMocks()
    if (originalResponse === undefined) {
        delete global.Response
    } else {
        global.Response = originalResponse
    }
})

describe('UIRender asynchronous failure and callback contracts', () => {
    it('shows a plain-text apply failure instead of rejecting while parsing it as JSON', async () => {
        class ResponseStub {
            constructor (body) {
                this.body = body
            }

            text = jest.fn(async () => this.body)
        }

        global.Response = ResponseStub
        const failure = new ResponseStub('Service temporarily unavailable')
        const updateExperienceData = jest.fn().mockRejectedValue(failure)
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

        render(withProviders(
            <UIRender
                form
                meta={{
                    view: 'Button',
                    children: 'Apply periods with unavailable service',
                    onClick: { name: 'onApplyPeriods' },
                }}
                data={{ requestId: 'request-plain-error' }}
                initialValues={{ requestId: 'request-plain-error' }}
                apiCalls={{ updateExperienceData }}
            />
        ))

        fireEvent.click(screen.getByRole('button', {
            name: 'Apply periods with unavailable service',
        }))

        await waitFor(() => expect(appContext.setPopupState).toHaveBeenCalledTimes(1))
        expect(failure.text).toHaveBeenCalledTimes(1)
        const popupState = appContext.setPopupState.mock.calls[0][0]
        expect(popupState.title).toBe('Error')
        expect(popupState.content.props.data).toEqual({
            message: 'Service temporarily unavailable',
        })
        expect(consoleError).toHaveBeenCalledWith(failure)
    })

    it('preserves current form data when apply returns no replacement payload', async () => {
        const data = {
            requestId: 'request-empty-response',
            status: 'Keep current status',
        }
        const getFormData = jest.fn()
        const updateExperienceData = jest.fn().mockResolvedValue(null)

        render(withProviders(
            <UIRender
                form
                meta={{
                    view: 'Row',
                    items: [
                        { view: 'Text', children: { name: 'status' } },
                        {
                            view: 'Button',
                            children: 'Apply empty response',
                            onClick: { name: 'onApplyPeriods' },
                        },
                    ],
                }}
                data={data}
                initialValues={data}
                getFormData={getFormData}
                apiCalls={{ updateExperienceData }}
            />
        ))

        const readFormData = getFormData.mock.calls[0][0]
        fireEvent.click(screen.getByRole('button', { name: 'Apply empty response' }))

        await waitFor(() => expect(updateExperienceData).toHaveBeenCalledWith(data))
        expect(screen.getByText('Keep current status')).toBeInTheDocument()
        expect(readFormData()).toEqual(data)
        expect(appContext.setPopupState).not.toHaveBeenCalled()
    })

    it('forwards edits from a dynamically mounted nested data form to the root callback', async () => {
        // Input currently forwards several internal props to the DOM in development mode.
        jest.spyOn(console, 'error').mockImplementation(() => {})
        const onDataChanged = jest.fn()
        const data = {
            dataKind: {
                rows: [{ name: 'Before nested edit' }],
            },
        }
        const nestedMeta = {
            view: 'Table',
            name: 'dataKind.rows',
            headers: [{ id: 'name', label: 'Name' }],
            renderItemCells: {
                view: 'Data',
                kind: 'rows',
                embedded: true,
                meta: {
                    view: 'TableCells',
                    items: [
                        { view: 'Input', name: 'name', label: 'Nested name' },
                    ],
                },
            },
        }
        const view = render(withProviders(
            <UIRender
                form
                meta={{ view: 'Text', children: 'Preparing nested editor' }}
                data={data}
                initialValues={data}
                onDataChanged={onDataChanged}
            />
        ))

        view.rerender(withProviders(
            <UIRender
                form
                meta={nestedMeta}
                data={data}
                initialValues={data}
                onDataChanged={onDataChanged}
            />
        ))

        const nestedInput = await screen.findByLabelText('Nested name')
        fireEvent.focus(nestedInput)
        fireEvent.change(nestedInput, { target: { value: 'After nested edit' } })

        await waitFor(() => expect(onDataChanged).toHaveBeenCalled())
        expect(nestedInput).toHaveValue('After nested edit')
    })

    it('warns without crashing when a root action tries to add child data', () => {
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})

        render(withProviders(
            <UIRender
                meta={{
                    view: 'Button',
                    children: 'Add orphan row',
                    onClick: { name: 'addData' },
                }}
                data={{}}
            />
        ))

        fireEvent.click(screen.getByRole('button', { name: 'Add orphan row' }))

        expect(consoleWarn).toHaveBeenCalledTimes(1)
        expect(consoleWarn).toHaveBeenCalledWith(
            'Missing parent UI Render instance to modify form values!',
            expect.anything()
        )
        expect(appContext.setPopupState).not.toHaveBeenCalled()
    })
})
