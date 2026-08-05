// rules.js registers `fetch` in the action map while building meta.
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}

import React from 'react' // eslint-disable-line import/first
import { fireEvent, render, screen, waitFor } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
// Load the form module before rules.js follows the mapper/renders circular dependency.
import { storedTouched } from '../../../modules/form/utils' // eslint-disable-line import/first
import UIRender, { clearErrorsMap, formsStorage } from '../rules' // eslint-disable-line import/first
import { AppContext } from '../../../contexts' // eslint-disable-line import/first
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext' // eslint-disable-line import/first

const popup = {
    setPopupState: jest.fn(),
    popup: { setPopupState: jest.fn() },
}

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={popup}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

const makeAddDataMeta = () => ({
    view: 'Table',
    name: 'dataKind.rows',
    headers: [
        { id: 'name', label: 'Name' },
    ],
    renderExtraItem: {
        view: 'Data',
        kind: 'rows',
        embedded: true,
        initialValues: {},
        meta: {
            view: 'TableCells',
            items: [
                {
                    view: 'Input',
                    name: 'name',
                    type: 'text',
                    label: 'Draft name',
                    validate: 'required',
                },
                {
                    view: 'Button',
                    children: 'Add row',
                    onClick: { name: 'addData' },
                },
            ],
        },
    },
})

describe('UIRender action orchestration', () => {
    let originalCreateObjectURL
    let originalRevokeObjectURL
    let anchorClick

    beforeEach(() => {
        formsStorage.clear()
        clearErrorsMap()
        Object.keys(storedTouched).forEach(key => delete storedTouched[key])
        popup.setPopupState.mockClear()
        popup.popup.setPopupState.mockClear()
        originalCreateObjectURL = URL.createObjectURL
        originalRevokeObjectURL = URL.revokeObjectURL
        anchorClick = undefined
    })

    afterEach(() => {
        if (anchorClick) anchorClick.mockRestore()
        URL.createObjectURL = originalCreateObjectURL
        URL.revokeObjectURL = originalRevokeObjectURL
        formsStorage.clear()
        clearErrorsMap()
        Object.keys(storedTouched).forEach(key => delete storedTouched[key])
    })

    it('downloads the requested API response using the configured file name', async () => {
        const blob = new Blob(['period,value\n2026,42'], { type: 'text/csv' })
        const response = { blob: jest.fn().mockResolvedValue(blob) }
        const downloadFile = jest.fn().mockResolvedValue(response)
        URL.createObjectURL = jest.fn().mockReturnValue('blob:report')
        URL.revokeObjectURL = jest.fn()
        anchorClick = jest
            .spyOn(HTMLAnchorElement.prototype, 'click')
            .mockImplementation(() => {})

        render(wrap(
            <UIRender
                meta={{
                    view: 'Button',
                    children: 'Download report',
                    onClick: {
                        name: 'download',
                        args: ['historical-data.csv'],
                    },
                }}
                data={{}}
                apiCalls={{ downloadFile }}
            />
        ))

        fireEvent.click(screen.getByRole('button', { name: 'Download report' }))

        await waitFor(() => expect(anchorClick).toHaveBeenCalledTimes(1))
        expect(downloadFile).toHaveBeenCalledWith('historical-data.csv')
        expect(response.blob).toHaveBeenCalledTimes(1)
        expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:report')
    })

    it('uploads a selected file with current form data excluding the file field', async () => {
        // Keep the request pending: this test characterizes the outbound contract independently
        // from response-driven form reinitialization.
        const uploadFile = jest.fn(() => new Promise(() => {}))
        const data = {
            policyNumber: 'P-100',
            nested: { enabled: true },
            file: 'stale-file-value',
        }

        const { container } = render(wrap(
            <UIRender
                meta={{
                    view: 'Input',
                    name: 'file',
                    type: 'file',
                    title: 'Upload CSV',
                    formats: ['csv'],
                    multiple: false,
                    onChange: 'upload',
                }}
                data={data}
                initialValues={data}
                apiCalls={{ uploadFile }}
            />
        ))

        const file = new File(['name,value\nA,1'], 'rates.csv', { type: 'text/csv' })
        fireEvent.change(container.querySelector('input[type="file"]'), {
            target: { files: [file] },
        })

        await waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(1))
        expect(uploadFile).toHaveBeenCalledWith(
            JSON.stringify({
                policyNumber: 'P-100',
                nested: { enabled: true },
            }),
            file
        )
    })

    it('reinitializes the UI with a successful upload response', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            const uploadFile = jest.fn().mockResolvedValue({
                status: 'After upload',
            })
            const data = {
                status: 'Before upload',
                file: 'stale-file-value',
            }
            const { container } = render(wrap(
                <UIRender
                    meta={{
                        view: 'Row',
                        items: [
                            { view: 'Text', children: { name: 'status' } },
                            {
                                view: 'Input',
                                name: 'file',
                                type: 'file',
                                title: 'Upload replacement',
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

            expect(screen.getByText('Before upload')).toBeInTheDocument()
            consoleError.mockClear()
            const fileInput = container.querySelector('input[type="file"]')
            const setInputValue = jest.fn()
            Object.defineProperty(fileInput, 'value', {
                configurable: true,
                get: () => '',
                set: setInputValue,
            })
            const file = new File(['replacement'], 'replacement.csv', { type: 'text/csv' })
            fireEvent.change(fileInput, {
                target: { files: [file] },
            })

            await waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(1))
            await waitFor(
                () => expect(screen.getByText('After upload')).toBeInTheDocument(),
                { timeout: 250 }
            )
            expect(setInputValue).toHaveBeenCalledWith(null)
            expect(consoleError).not.toHaveBeenCalled()
        } finally {
            consoleError.mockRestore()
        }
    })

    it('submits the latest form values through a meta-defined submit action', async () => {
        const onSubmit = jest.fn()
        const data = { customerName: 'Before edit' }
        render(wrap(
            <UIRender
                meta={{
                    view: 'Row',
                    items: [
                        {
                            view: 'Input',
                            name: 'customerName',
                            type: 'text',
                            label: 'Customer name',
                        },
                        {
                            view: 'Button',
                            children: 'Save changes',
                            onClick: { name: 'submit' },
                        },
                    ],
                }}
                data={data}
                initialValues={data}
                onSubmit={onSubmit}
            />
        ))

        fireEvent.change(screen.getByLabelText('Customer name'), {
            target: { value: 'After edit' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0][0]).toEqual({ customerName: 'After edit' })
    })

    it('adds a valid draft row to dataKind and clears the draft form', async () => {
        let getCurrentFormData
        const data = {
            dataKind: {
                rows: [{ name: 'Existing row' }],
            },
        }
        render(wrap(
            <UIRender
                meta={makeAddDataMeta()}
                data={data}
                initialValues={data}
                form
                getFormData={(getter) => {
                    getCurrentFormData = getter
                }}
            />
        ))

        const draft = screen.getByLabelText('Draft name')
        fireEvent.change(draft, { target: { value: 'Added row' } })
        fireEvent.click(screen.getByRole('button', { name: 'Add row' }))

        await waitFor(() => expect(screen.getByText('Added row')).toBeInTheDocument())
        expect(screen.getByLabelText('Draft name')).toHaveValue('')
        expect(getCurrentFormData()).toEqual({
            dataKind: {
                rows: [
                    { name: 'Existing row' },
                    { name: 'Added row' },
                ],
            },
        })
    })

    it('submits validation for an invalid draft without adding a row', async () => {
        let getCurrentFormData
        const data = {
            dataKind: {
                rows: [{ name: 'Existing row' }],
            },
        }
        render(wrap(
            <UIRender
                meta={makeAddDataMeta()}
                data={data}
                initialValues={data}
                form
                getFormData={(getter) => {
                    getCurrentFormData = getter
                }}
            />
        ))

        fireEvent.click(screen.getByRole('button', { name: 'Add row' }))

        await waitFor(() => expect(screen.getByText('Required')).toBeInTheDocument())
        expect(screen.getAllByRole('row')).toHaveLength(3)
        expect(getCurrentFormData()).toEqual(data)
    })

    it('removes the clicked dataKind row and exposes the compacted form data', async () => {
        let getCurrentFormData
        const data = {
            dataKind: {
                rows: [
                    { name: 'Keep me' },
                    { name: 'Remove me' },
                ],
            },
        }
        const meta = {
            view: 'Table',
            name: 'dataKind.rows',
            headers: [
                { id: 'name', label: 'Name' },
                { id: 'actions', label: 'Actions' },
            ],
            renderItemCells: {
                view: 'Data',
                kind: 'rows',
                embedded: true,
                meta: {
                    view: 'TableCells',
                    items: [
                        { view: 'Input', name: 'name', type: 'text' },
                        {
                            view: 'Button',
                            children: 'Remove row',
                            onClick: { name: 'removeData' },
                        },
                    ],
                },
            },
        }

        render(wrap(
            <UIRender
                meta={meta}
                data={data}
                initialValues={data}
                form
                getFormData={(getter) => {
                    getCurrentFormData = getter
                }}
            />
        ))

        const buttons = screen.getAllByRole('button', { name: 'Remove row' })
        expect(buttons).toHaveLength(2)
        fireEvent.click(buttons[1])

        await waitFor(() => {
            expect(screen.getAllByRole('button', { name: 'Remove row' })).toHaveLength(1)
        })
        expect(screen.getByDisplayValue('Keep me')).toBeInTheDocument()
        expect(screen.queryByDisplayValue('Remove me')).not.toBeInTheDocument()
        expect(getCurrentFormData()).toEqual({
            dataKind: {
                rows: [{ name: 'Keep me' }],
            },
        })
    })
})
