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
import { AppProvider } from '../../../providers' // eslint-disable-line import/first

const popupTableMeta = (popupItems, title = 'Row override') => ({
    view: 'Table',
    name: 'experienceRatingInputs.uwOverridesCoverage',
    headers: [
        { id: 'coverageType', label: 'Coverage' },
        { id: 'actions', label: 'Actions' },
    ],
    renderItemCells: {
        view: 'TableCells',
        items: [
            { view: 'Text', name: 'coverageType' },
            {
                view: 'Col',
                items: [
                    {
                        view: 'Button',
                        children: 'Override row',
                        onClick: {
                            name: 'popupOpen',
                            args: ['override-reason.{index}'],
                        },
                    },
                    {
                        view: 'Popup',
                        id: 'override-reason.{index}',
                        title,
                        items: popupItems,
                    },
                ],
            },
        ],
    },
})

const popupData = {
    experienceRatingInputs: {
        uwOverridesCoverage: [
            {
                coverageType: 'Dental',
                inforceRateOverrideReason: 'Original reason',
            },
        ],
    },
    requestId: 'request-popup',
}

let popupRoot
let consoleError

beforeEach(() => {
    popupRoot = document.createElement('div')
    popupRoot.id = 'render-popup-root'
    document.body.appendChild(popupRoot)
    // React 16 reports known prop-forwarding warnings from the existing renderer.
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
    cleanup()
    popupRoot.remove()
    formsStorage.clear()
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
    jest.restoreAllMocks()
})

describe('UIRender dynamic action and data-integrity contracts', () => {
    it('opens a row popup with the correct field path and persists the edit', async () => {
        const getFormData = jest.fn()
        const meta = popupTableMeta([
            {
                view: 'Input',
                name: 'inforceRateOverrideReason',
                label: 'Override reason',
            },
        ])

        render(
            <AppProvider>
                <UIRender
                    form
                    meta={meta}
                    data={popupData}
                    initialValues={popupData}
                    getFormData={getFormData}
                />
            </AppProvider>
        )

        fireEvent.click(screen.getByRole('button', { name: 'Override row' }))

        const reasonInput = await screen.findByLabelText('Override reason')
        expect(screen.getByText('Row override')).toBeInTheDocument()
        expect(reasonInput).toHaveAttribute(
            'name',
            'experienceRatingInputs.uwOverridesCoverage[0].inforceRateOverrideReason'
        )
        expect(reasonInput).toHaveValue('Original reason')

        fireEvent.focus(reasonInput)
        fireEvent.change(reasonInput, { target: { value: 'Actuarial review' } })

        const readFormData = getFormData.mock.calls[0][0]
        await waitFor(() => {
            expect(readFormData().experienceRatingInputs.uwOverridesCoverage[0])
                .toEqual(expect.objectContaining({
                    coverageType: 'Dental',
                    inforceRateOverrideReason: 'Actuarial review',
                }))
        })
    })

    // The documented way to scope a Popup that is declared outside the row: state the table in the args.
    // Nothing in the data is probed, so it works for any field naming.
    it('scopes a table-external popup to the clicked row when the args carry a relativePath', async () => {
        const getFormData = jest.fn()
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const meta = {
            view: 'Col',
            items: [
                {
                    view: 'Popup', id: 'edit.{index}', name: 'orders', title: 'Row note',
                    items: [{ view: 'Input', name: 'note', label: 'Note' }],
                },
                {
                    view: 'Table', name: 'orders',
                    headers: [{ id: 'orderNo', label: 'Order' }, { id: 'actions', label: 'Actions' }],
                    renderItemCells: {
                        view: 'TableCells',
                        items: [
                            { view: 'Text', name: 'orderNo' },
                            {
                                view: 'Button', children: 'Edit note',
                                onClick: { name: 'popupOpen', args: ['edit.{index}', { relativePath: 'orders' }] },
                            },
                        ],
                    },
                },
            ],
        }
        const data = { orders: [{ orderNo: 'A-1', note: 'first' }, { orderNo: 'A-2', note: 'second' }] }

        render(
            <AppProvider>
                <UIRender form meta={meta} data={data} initialValues={data} getFormData={getFormData}/>
            </AppProvider>
        )

        fireEvent.click(screen.getAllByRole('button', { name: 'Edit note' })[1])

        const noteInput = await screen.findByLabelText('Note')
        expect(noteInput).toHaveAttribute('name', 'orders[1].note')
        expect(noteInput).toHaveValue('second')
        expect(consoleWarn).not.toHaveBeenCalled()

        fireEvent.focus(noteInput)
        fireEvent.change(noteInput, { target: { value: 'Amended' } })

        const readFormData = getFormData.mock.calls[0][0]
        await waitFor(() => {
            expect(readFormData().orders[1].note).toBe('Amended')
        })
        // The sibling row and the root are left alone.
        expect(readFormData().orders[0].note).toBe('first')
        expect(readFormData().note).toBeUndefined()
    })

    it('turns an empty dynamic popup template into a visible configuration error', async () => {
        render(
            <AppProvider>
                <UIRender
                    form
                    meta={popupTableMeta([], 'Broken row popup')}
                    data={popupData}
                    initialValues={popupData}
                />
            </AppProvider>
        )

        fireEvent.click(screen.getByRole('button', { name: 'Override row' }))

        await waitFor(() => expect(screen.getByText('Broken row popup')).toBeInTheDocument())
        expect(screen.getByText(/Popup content is empty/)).toBeInTheDocument()
        expect(consoleError).toHaveBeenCalledWith('Popup items are empty or invalid:', [])
    })

    it('recursively updates every matching data key through updateDataOnChange', async () => {
        const data = {
            status: 'Root before',
            nested: { status: 'Nested before' },
            rows: [{ status: 'Row before' }],
        }
        const meta = {
            view: 'Row',
            items: [
                { view: 'Text', name: 'status' },
                { view: 'Text', name: 'nested.status' },
                { view: 'Text', name: 'rows[0].status' },
                {
                    view: 'Button',
                    children: 'Synchronize statuses',
                    onClick: {
                        name: 'updateDataOnChange',
                        mapArgs: ['Unified status', { name: 'status' }],
                    },
                },
            ],
        }

        render(
            <AppProvider>
                <UIRender meta={meta} data={data} initialValues={data} />
            </AppProvider>
        )

        expect(screen.getByText('Root before')).toBeInTheDocument()
        expect(screen.getByText('Nested before')).toBeInTheDocument()
        expect(screen.getByText('Row before')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Synchronize statuses' }))

        await waitFor(() => expect(screen.getAllByText('Unified status')).toHaveLength(3))
        expect(screen.queryByText('Root before')).not.toBeInTheDocument()
        expect(screen.queryByText('Nested before')).not.toBeInTheDocument()
        expect(screen.queryByText('Row before')).not.toBeInTheDocument()
    })

    it('rebuilds currency rendering when meta.currencyCode changes', async () => {
        const data = { amount: 12.5 }
        const meta = (currencyCode) => ({
            view: 'Row',
            currencyCode,
            items: [
                {
                    view: 'Text',
                    children: { name: 'amount' },
                    renderLabel: { name: 'Currency', decimals: 2 },
                },
            ],
        })
        const { rerender } = render(
            <AppProvider>
                <UIRender
                    meta={meta('USD')}
                    data={data}
                    initialValues={data}
                />
            </AppProvider>
        )

        expect(screen.getByText('$')).toBeInTheDocument()

        rerender(
            <AppProvider>
                <UIRender
                    meta={meta('EUR')}
                    data={data}
                    initialValues={data}
                />
            </AppProvider>
        )

        await waitFor(() => expect(screen.getByText('€')).toBeInTheDocument())
        expect(screen.queryByText('$')).not.toBeInTheDocument()
    })
})
