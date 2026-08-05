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
import UIRender, { UIRender as RawUIRender, clearErrorsMap, formsStorage } from '../rules' // eslint-disable-line import/first
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

afterEach(() => {
    cleanup()
    formsStorage.clear()
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
    appContext.setPopupState.mockClear()
    jest.restoreAllMocks()
})

describe('UIRender lifecycle and form orchestration contracts', () => {
    it('notifies onDataChanged after a user makes the form dirty', async () => {
        // The current renderer forwards this callback to the native input and React warns about it.
        jest.spyOn(console, 'error').mockImplementation(() => {})
        const onDataChanged = jest.fn()
        const values = { policyName: 'Before edit' }

        render(withProviders(
            <UIRender
                form
                meta={{ view: 'Input', name: 'policyName', label: 'Policy name' }}
                data={values}
                initialValues={values}
                onDataChanged={onDataChanged}
            />
        ))

        fireEvent.focus(screen.getByLabelText('Policy name'))
        fireEvent.change(screen.getByLabelText('Policy name'), {
            target: { value: 'After edit' },
        })

        await waitFor(() => expect(onDataChanged).toHaveBeenCalledTimes(1))
    })

    it('re-resolves state-dependent meta after a Select changes', async () => {
        // The existing Dropdown field updates its cached value during render in development mode.
        jest.spyOn(console, 'error').mockImplementation(() => {})
        const values = {
            plan: '0',
            plans: [
                { label: 'Basic option', detail: 'Basic details' },
                { label: 'Advanced option', detail: 'Advanced details' },
            ],
        }
        const meta = {
            view: 'Row',
            items: [
                {
                    view: 'Select',
                    name: 'plan',
                    label: 'Plan',
                    options: { name: 'plans' },
                    mapOptions: { text: 'label', value: '{index}' },
                },
                { view: 'Text', name: 'plans.{state.plan,0}.detail' },
            ],
        }
        const { container } = render(withProviders(
            <UIRender
                form
                meta={meta}
                data={values}
                initialValues={values}
            />
        ))

        expect(screen.getByText('Basic details')).toBeInTheDocument()

        fireEvent.click(container.querySelector('.ui.dropdown'))
        fireEvent.click(screen.getByText('Advanced option'))

        await waitFor(() => expect(screen.getByText('Advanced details')).toBeInTheDocument())
        expect(screen.queryByText('Basic details')).not.toBeInTheDocument()
    })

    it('resets edited values to the initial form snapshot', async () => {
        const getFormData = jest.fn()
        const values = {
            customer: { name: 'Alice' },
            requestId: 'request-reset',
        }
        render(withProviders(
            <UIRender
                form
                meta={{
                    view: 'Row',
                    items: [
                        { view: 'Input', name: 'customer.name', label: 'Customer name' },
                        { view: 'Button', children: 'Reset changes', onClick: 'reset' },
                    ],
                }}
                data={values}
                initialValues={values}
                getFormData={getFormData}
            />
        ))
        const readFormData = getFormData.mock.calls[0][0]
        const input = screen.getByLabelText('Customer name')

        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'Grace' } })
        await waitFor(() => expect(readFormData().customer.name).toBe('Grace'))
        fireEvent.blur(input)

        fireEvent.click(screen.getByRole('button', { name: 'Reset changes' }))

        await waitFor(() => expect(input).toHaveValue('Alice'))
        expect(readFormData()).toEqual(values)
    })

    it('reconciles live dataKind rows, preserving an empty row, before submit', async () => {
        const onSubmit = jest.fn()
        const values = {
            dataKind: {
                periods: [
                    { label: 'Before edit' },
                    {},
                ],
            },
            requestId: 'request-periods',
        }
        render(withProviders(
            <UIRender
                form
                meta={{
                    view: 'Row',
                    items: [
                        {
                            view: 'Input',
                            name: 'dataKind.periods[0].label',
                            label: 'Period label',
                        },
                        { view: 'Button', children: 'Submit periods', onClick: 'submit' },
                    ],
                }}
                data={values}
                initialValues={values}
                onSubmit={onSubmit}
            />
        ))

        fireEvent.focus(screen.getByLabelText('Period label'))
        fireEvent.change(screen.getByLabelText('Period label'), {
            target: { value: 'After edit' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Submit periods' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0][0]).toEqual({
            dataKind: {
                periods: [
                    { label: 'After edit' },
                    {},
                ],
            },
            requestId: 'request-periods',
        })
    })

    it('unregisters and re-registers a nested dataKind child when its index changes', () => {
        const values = { label: 'Nested row' }
        const formApi = {
            getState: jest.fn(() => ({ values })),
            getRegisteredFields: jest.fn(() => []),
            getFieldState: jest.fn(),
            submit: jest.fn(),
            reset: jest.fn(),
            change: jest.fn(),
        }
        const formHost = {
            form: formApi,
            handleSubmit: jest.fn(),
        }
        const parent = {
            form: formApi,
            handleSubmit: jest.fn(),
            registerDataKind: jest.fn(),
            unregisterDataKind: jest.fn(),
        }
        const meta = { view: 'Text', children: 'Nested row' }
        const form = { kind: 'periods' }
        const formProps = { pristine: true, valid: true, values, touched: {} }
        const commonProps = {
            parent,
            form,
            formProps,
            instance: formHost,
            embedded: true,
            meta,
            data: values,
            initialValues: values,
        }
        const { rerender, unmount } = render(withProviders(
            <RawUIRender {...commonProps} index={0} />
        ))

        expect(parent.registerDataKind).toHaveBeenCalledTimes(1)
        const child = parent.registerDataKind.mock.calls[0][0]
        expect(parent.registerDataKind).toHaveBeenLastCalledWith(child, 'periods', 0)

        rerender(withProviders(
            <RawUIRender {...commonProps} index={1} />
        ))

        expect(parent.unregisterDataKind).toHaveBeenLastCalledWith(child, 'periods', 0)
        expect(parent.registerDataKind).toHaveBeenLastCalledWith(child, 'periods', 1)

        unmount()
        expect(parent.unregisterDataKind).toHaveBeenLastCalledWith(child, 'periods', 1)
    })
})
