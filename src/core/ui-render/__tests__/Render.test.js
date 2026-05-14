import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import Render from '../Render'

function setupRender (componentRenderer = ({ children }) => <div data-testid="rendered">{children}</div>) {
    Render.Component = componentRenderer
    Render.Method = jest.fn(() => () => null)
}

describe('Render', () => {
    afterEach(() => {
        Render.Component = undefined
        Render.Method = undefined
        Render.Tooltip = undefined
    })

    it('throws (logs) when Render.Component or Render.Method is not set', () => {
        // componentDidMount throws synchronously inside React, which surfaces as a console.error.
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => render(Render({ view: 'X', items: [] }))).toThrow()
        spy.mockRestore()
    })

    it('invokes Render.Component with passed-through props', () => {
        const spy = jest.fn(() => null)
        setupRender(spy)
        render(Render({ view: 'X', items: [], data: { a: 1 } }))
        expect(spy).toHaveBeenCalled()
        expect(spy.mock.calls[0][0].view).toBe('X')
        expect(spy.mock.calls[0][0].data).toEqual({ a: 1 })
    })

    it('extracts _data by name from data', () => {
        const spy = jest.fn(() => null)
        setupRender(spy)
        render(Render({ view: 'Text', name: 'a.b', items: [], data: { a: { b: 42 } } }))
        expect(spy.mock.calls[0][0]._data).toBe(42)
    })

    it('Table view extracts data even with relativeData=false', () => {
        const spy = jest.fn(() => null)
        setupRender(spy)
        render(
            Render({
                view: 'Table',
                name: 'items',
                relativeData: false,
                items: [],
                data: { items: [1, 2, 3] },
            })
        )
        expect(spy.mock.calls[0][0]._data).toEqual([1, 2, 3])
    })

    it('does not extract _data when relativeData is false (for non-Table)', () => {
        const spy = jest.fn(() => null)
        setupRender(spy)
        render(
            Render({
                view: 'Text',
                name: 'a.b',
                relativeData: false,
                items: [],
                data: { a: { b: 42 } },
            })
        )
        // _data should be undefined since we did not pass _data and relativeData=false skips extraction
        expect(spy.mock.calls[0][0]._data).toBeUndefined()
    })

    it('passes relativePath/relativeIndex down to child items', () => {
        const spy = jest.fn(() => null)
        setupRender(spy)
        render(
            Render({
                view: 'List',
                items: [{ view: 'Text' }],
                relativePath: 'orders',
                relativeIndex: 2,
            })
        )
        const items = spy.mock.calls[0][0].items
        expect(items[0].relativePath).toBe('orders')
        expect(items[0].relativeIndex).toBe(2)
    })

    it('wraps with Tooltip when tooltip prop is set', () => {
        const ChildComponent = jest.fn(() => <span data-testid="rendered">child</span>)
        setupRender(ChildComponent)
        Render.Tooltip = ({ children, title }) => (
            <div data-testid="tooltip" data-title={title}>
                {children}
            </div>
        )
        const { container } = render(Render({ view: 'Text', items: [], tooltip: 'hint' }))
        expect(container.querySelector('[data-testid="tooltip"]')).toHaveAttribute('data-title', 'hint')
        expect(container.querySelector('[data-testid="rendered"]')).toBeInTheDocument()
    })

    it('forwards currencyCode from instance state when not set', () => {
        const spy = jest.fn(() => null)
        setupRender(spy)
        render(
            Render({
                view: 'Text',
                items: [],
                instance: { state: { currencyCode: 'EUR' } },
            })
        )
        expect(spy.mock.calls[0][0].currencyCode).toBe('EUR')
    })
})
