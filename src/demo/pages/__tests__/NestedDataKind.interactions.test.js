import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../../core/contexts'
import { cloneDeep } from '../../../core/utils'
import { Render } from '../../../core/engine'
import UIRender from '../../../core/engine/rules'
import { formsStorage } from '../../../core/state/formRegistry'
import data from '../../examples/nested-datakind_data.json'
import meta from '../../examples/nested-datakind_meta.json'

const appContext = {
    ...initialAppState,
    setPopupState: jest.fn(),
    togglePopupState: jest.fn(),
}

const withProviders = ui => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={appContext}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

const clearGlobalRegistries = () => {
    formsStorage.clear()
}

describe('nested dataKind demo interaction contract', () => {
    const originalRenderOnError = Render.onError
    let caughtRenderErrors
    let consoleError

    beforeEach(() => {
        clearGlobalRegistries()
        caughtRenderErrors = []
        Render.onError = ({ error }) => caughtRenderErrors.push(error)
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        appContext.setPopupState.mockClear()
        appContext.togglePopupState.mockClear()
    })

    afterEach(() => {
        Render.onError = originalRenderOnError
        consoleError.mockRestore()
        clearGlobalRegistries()
    })

    it('removes, reindexes, edits, and appends line items inside one parent phase', async () => {
        let getCurrentFormData
        const { unmount } = render(withProviders(
            <UIRender
                data={cloneDeep(data)}
                meta={cloneDeep(meta)}
                initialValues={cloneDeep(data)}
                form={{ id: 'nested-data-kind-contract' }}
                getFormData={getter => { getCurrentFormData = getter }}
                translate={value => value}
            />
        ))

        const firstLineSku = screen.getByDisplayValue('DES-001')
        const firstLineRow = firstLineSku.closest('tr')
        expect(firstLineRow).not.toBeNull()
        fireEvent.click(within(firstLineRow).getByRole('button'))

        await waitFor(() => {
            expect(screen.queryByDisplayValue('DES-001')).not.toBeInTheDocument()
        })

        const reindexedSku = screen.getByDisplayValue('DES-002')
        expect(reindexedSku).toHaveAttribute(
            'name',
            'dataKind.phases.0.dataKind.lineItems[0].sku'
        )
        const reindexedRow = reindexedSku.closest('tr')
        const description = reindexedRow.querySelector('input[name$=".description"]')
        fireEvent.change(description, { target: { value: 'Mockups revised' } })

        const innerTable = reindexedSku.closest('table')
        const addButton = within(innerTable).getByRole('button', { name: 'Add line' })
        const draftRow = addButton.closest('tr')
        fireEvent.change(draftRow.querySelector('input[name="sku"]'), {
            target: { value: 'DES-003' },
        })
        fireEvent.change(draftRow.querySelector('input[name="description"]'), {
            target: { value: 'Prototype' },
        })
        fireEvent.change(draftRow.querySelector('input[name="qty"]'), {
            target: { value: '2' },
        })
        fireEvent.change(draftRow.querySelector('input[name="unitPrice"]'), {
            target: { value: '300' },
        })
        fireEvent.click(addButton)

        await waitFor(() => {
            expect(screen.getByDisplayValue('DES-003')).toBeInTheDocument()
        })

        const current = getCurrentFormData()
        expect(current.dataKind.phases[0].dataKind.lineItems).toEqual([
            {
                sku: 'DES-002',
                description: 'Mockups revised',
                qty: 5,
                unitPrice: 200,
            },
            {
                sku: 'DES-003',
                description: 'Prototype',
                qty: 2,
                unitPrice: 300,
            },
        ])
        expect(current.dataKind.phases[1]).toEqual(data.dataKind.phases[1])
        expect(caughtRenderErrors).toEqual([])
        // Match warnings on message text only. React 16-18 prefix `Warning:` and append a
        // component stack (the source of component names and file paths), React 19 emits the bare
        // message.
        const warningMessages = consoleError.mock.calls.map(call => call.map(String).join(' '))
        // This test used to pin the `currencyCode` DOM-prop leak as expected. It is fixed: the
        // engine-internal prop is stripped in mapper.tsx's RenderComponent, so it never reaches a
        // DOM element. Kept inverted as a regression guard -- no unknown-prop warning may return.
        const unknownPropWarnings = warningMessages.filter(message => (
            message.includes('React does not recognize')
        ))
        expect(unknownPropWarnings).toEqual([])
        // Nor any other warning. This used to tolerate two, `formProps` and `instance` marked as
        // required on the nested row's document, which shares its parent's form and is rendered
        // without either. The prop types went at §9.6-E5, so on no React major can either return.
        expect(warningMessages).toEqual([])

        unmount()
        expect(formsStorage.size).toBe(0)
    })
})
