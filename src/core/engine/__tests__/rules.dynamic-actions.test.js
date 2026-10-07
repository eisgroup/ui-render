import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
// Load form registration before rules.tsx follows the mapper/renders cycle.
import UIRender from '../rules'
import { formsStorage } from '../../state/formRegistry'
import { AppProvider } from '../../providers'

const popupTableMeta = (popupItems, title = 'Row override') => ({
    view: 'Table',
    name: 'experienceRatingInputs.overrideOptions',
    headers: [
        { id: 'optionType', label: 'Option' },
        { id: 'actions', label: 'Actions' },
    ],
    renderItemCells: {
        view: 'TableCells',
        items: [
            { view: 'Text', name: 'optionType' },
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
        overrideOptions: [
            {
                optionType: 'Standard',
                rateOverrideReason: 'Original reason',
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
    jest.restoreAllMocks()
})

describe('UIRender dynamic action and data-integrity contracts', () => {
    it('opens a row popup with the correct field path and persists the edit', async () => {
        const getFormData = jest.fn()
        const meta = popupTableMeta([
            {
                view: 'Input',
                name: 'rateOverrideReason',
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
            'experienceRatingInputs.overrideOptions[0].rateOverrideReason'
        )
        expect(reasonInput).toHaveValue('Original reason')

        fireEvent.focus(reasonInput)
        fireEvent.change(reasonInput, { target: { value: 'Manual review' } })

        const readFormData = getFormData.mock.calls[0][0]
        await waitFor(() => {
            expect(readFormData().experienceRatingInputs.overrideOptions[0])
                .toEqual(expect.objectContaining({
                    optionType: 'Standard',
                    rateOverrideReason: 'Manual review',
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

    it('does nothing, rather than throwing, when updateDataOnChange gets no field object', () => {
        // `onChange` on a field passes `(value, {name})`, which is the shape the action reads. A
        // button that names the action with only a value used to die on click with
        // "Cannot destructure property 'name' of 'params[0]'" — uncaught, in an event handler.
        const data = { status: 'untouched' }
        const meta = {
            view: 'Row',
            items: [
                { view: 'Text', name: 'status' },
                { view: 'Button', children: 'Bare update', onClick: { name: 'updateDataOnChange', mapArgs: ['ignored'] } },
            ],
        }

        render(
            <AppProvider>
                <UIRender meta={meta} data={data} initialValues={data} />
            </AppProvider>
        )

        expect(() => fireEvent.click(screen.getByRole('button', { name: 'Bare update' }))).not.toThrow()
        expect(screen.getByText('untouched')).toBeInTheDocument()
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

    it('prints the document\'s currency in every form of `Currency`, an unknown code as itself, and a `symbol` of its own', () => {
        // Only `{name: 'Currency'}` at the top of a `render*` attribute took the document's currency: the
        // string form and both forms inside `values` printed `$` whatever `currencyCode` was, an unknown
        // code printed no symbol at all, and a definition's own `symbol` was replaced by the code's.
        const data = { amount: 12.5 }
        const label = renderLabel => ({ view: 'Text', children: { name: 'amount' }, renderLabel })
        const meta = currencyCode => ({
            view: 'Col',
            currencyCode,
            items: [
                label('Currency'),
                label({ values: {}, default: 'Currency' }),
                label({ values: {}, default: { name: 'Currency' } }),
                label({ name: 'Currency', symbol: 'CHF' }),
                label({ name: 'Currency' }),
            ],
        })
        const symbols = container => Array.from(container.querySelectorAll('.margin-right-smallest')).map(node => node.textContent)
        const mount = currencyCode => render(<AppProvider><UIRender meta={meta(currencyCode)} data={data} initialValues={data} /></AppProvider>)

        const view = mount('EUR')
        expect(symbols(view.container)).toEqual(['€', '€', '€', 'CHF', '€'])
        view.rerender(<AppProvider><UIRender meta={meta('JPY')} data={data} initialValues={data} /></AppProvider>)
        expect(symbols(view.container)).toEqual(['JPY', 'JPY', 'JPY', 'CHF', 'JPY'])
        view.unmount()
        expect(symbols(mount(undefined).container)).toEqual(['$', '$', '$', 'CHF', '$'])
    })
})
