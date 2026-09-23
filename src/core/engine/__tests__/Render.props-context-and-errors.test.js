import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Render from '../Render'

const originalOnError = Render.onError
const originalTooltipDefaults = Render.TooltipDefaultProps

const configure = (component = jest.fn(() => null)) => {
    Render.Component = component
    Render.Method = jest.fn(() => () => null)
    return component
}

describe('Render engine edge contracts', () => {
    afterEach(() => {
        Render.Component = undefined
        Render.Method = undefined
        Render.Tooltip = undefined
        Render.onError = originalOnError
        Render.TooltipDefaultProps = originalTooltipDefaults
        jest.restoreAllMocks()
    })

    it('reports child renderer failures and replaces the failed subtree with its error', async () => {
        const failure = new Error('renderer failed')
        configure(() => {
            throw failure
        })
        Render.onError = jest.fn()
        jest.spyOn(console, 'error').mockImplementation(() => {})

        render(Render({ view: 'Broken', items: [], data: { id: 7 } }))

        // The diagnostic rendered in place of the failed subtree names the node, not just the
        // error: a bare `String(error)` in a page of them says nothing about which declaration
        // to go and fix. Reported and rendered text are the same string (§9.4).
        expect(await screen.findByText(
            '[ui-render] render error at the meta root (view "Broken"): Error: renderer failed'
        )).toBeInTheDocument()
        await waitFor(() => expect(Render.onError).toHaveBeenCalledTimes(1))
        expect(Render.onError.mock.calls[0][0]).toEqual(expect.objectContaining({
            error: failure,
            path: '',
            message: '[ui-render] render error at the meta root (view "Broken"): Error: renderer failed',
            props: expect.objectContaining({ view: 'Broken', data: { id: 7 } }),
            errorInfo: expect.objectContaining({ componentStack: expect.any(String) }),
        }))
    })

    it('merges object tooltip options over renderer defaults', () => {
        const component = configure(jest.fn(() => <span>Value</span>))
        Render.TooltipDefaultProps = { inverted: true, position: 'bottom' }
        Render.Tooltip = jest.fn(({ children }) => <aside>{children}</aside>)

        render(Render({
            view: 'Text',
            items: [],
            tooltip: { inverted: false, position: 'top', title: 'Details' },
        }))

        // Assert on the props argument alone: the second argument React passes to function
        // components is version-specific (legacy context object on 16-18, `undefined` on 19).
        expect(Render.Tooltip).toHaveBeenCalledTimes(1)
        expect(Render.Tooltip.mock.calls[0][0]).toEqual(expect.objectContaining({
            inverted: false,
            position: 'top',
            title: 'Details',
        }))
        expect(component).toHaveBeenCalledTimes(1)
        expect(component.mock.calls[0][0]).toEqual(expect.not.objectContaining({ tooltip: expect.anything() }))
    })

    it('preserves explicit currency and strips the context-only date format', () => {
        const component = configure()

        render(Render({
            view: 'Text',
            items: [],
            currencyCode: 'PLN',
            dateFormat: 'DD/MM/YYYY',
            instance: { state: { currencyCode: 'EUR' } },
        }))

        expect(component.mock.calls[0][0]).toEqual(expect.objectContaining({ currencyCode: 'PLN' }))
        expect(component.mock.calls[0][0]).not.toHaveProperty('dateFormat')
    })

    it('propagates popup-relative context only to eligible child definitions', () => {
        const component = configure()
        const localData = { local: true }

        render(Render({
            view: 'View',
            data: { global: true },
            _data: { row: true },
            relativeData: false,
            relativeIndex: 3,
            relativePath: 'orders.3',
            items: [
                { view: 'Text', data: localData },
                { view: 'Table' },
            ],
        }))

        const [textItem, tableItem] = component.mock.calls[0][0].items
        expect(textItem).toEqual(expect.objectContaining({
            data: localData,
            relativeData: false,
            relativeIndex: 3,
            relativePath: 'orders.3',
        }))
        expect(tableItem).toEqual(expect.objectContaining({
            relativeIndex: 3,
            relativePath: 'orders.3',
        }))
        expect(tableItem).not.toHaveProperty('relativeData')
    })

    it('uses explicitly supplied local data as the base for named lookup', () => {
        const component = configure()

        render(Render({
            view: 'Text',
            name: 'customer.name',
            items: [],
            data: { customer: { name: 'global' } },
            _data: { customer: { name: 'local' } },
        }))

        expect(component.mock.calls[0][0]._data).toBe('local')
    })
})
