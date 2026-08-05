import React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../../core/contexts'
import { storedTouched } from '../../../core/modules/form/utils'
import { cloneDeep } from '../../../core/utils'
import { Render } from '../../../core/ui-render'
import UIRender, { clearErrorsMap, formsStorage } from '../../../core/pages/main/rules'
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
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
}

describe('nested dataKind demo interaction contract', () => {
    const originalRenderOnError = Render.onError
    const originalFetch = global.fetch
    let caughtRenderErrors
    let consoleError

    beforeEach(() => {
        clearGlobalRegistries()
        caughtRenderErrors = []
        Render.onError = ({ error }) => caughtRenderErrors.push(error)
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => Promise.resolve({}),
        }))
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        appContext.setPopupState.mockClear()
        appContext.togglePopupState.mockClear()
    })

    afterEach(() => {
        Render.onError = originalRenderOnError
        consoleError.mockRestore()
        clearGlobalRegistries()
        if (originalFetch === undefined) {
            delete global.fetch
        } else {
            global.fetch = originalFetch
        }
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
        const expectedWarnings = [
            ['React does not recognize', 'currencyCode', 'src/core/components/InputNative.js'],
            ['prop `formProps` is marked as required', 'UIRender', 'Data'],
            ['prop `instance` is marked as required', 'UIRender', 'Data'],
        ]
        expect(consoleError.mock.calls).toHaveLength(expectedWarnings.length)
        const warningMessages = consoleError.mock.calls.map(call => call.map(String).join(' '))
        expectedWarnings.forEach(requiredParts => {
            expect(warningMessages.some(message => (
                requiredParts.every(part => message.includes(part))
            ))).toBe(true)
        })

        unmount()
        expect(formsStorage.size).toBe(0)
    })
})
