import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Render from '../Render'

const defaultOnError = Render.onError
const defaultTooltipProps = Render.TooltipDefaultProps

function configure (component) {
    Render.Component = component
    Render.Method = jest.fn(() => () => null)
}

describe('Render recursive integration contracts', () => {
    afterEach(() => {
        Render.Component = undefined
        Render.Method = undefined
        Render.Tooltip = undefined
        Render.TooltipDefaultProps = defaultTooltipProps
        Render.onError = defaultOnError
        jest.restoreAllMocks()
    })

    it('reports a missing component resolver before checking the method resolver', () => {
        Render.Component = undefined
        Render.Method = jest.fn(() => () => null)
        jest.spyOn(console, 'error').mockImplementation(() => {})

        expect(() => render(Render({ view: 'Text', items: [] }))).toThrow(
            'Please setup Render.Component mapper first'
        )
    })

    it('recursively resolves nested names against each parent local value', () => {
        configure(({ view, items, _data }) => {
            if (view === 'Group') return <section>{items.map(Render)}</section>
            return <span>{String(_data)}</span>
        })

        render(Render({
            view: 'Group',
            data: {
                customer: {
                    name: 'Ada',
                    address: { city: 'Warsaw' },
                },
            },
            items: [{
                view: 'Group',
                name: 'customer',
                items: [
                    { view: 'Text', name: 'name' },
                    {
                        view: 'Group',
                        name: 'address',
                        items: [{ view: 'Text', name: 'city' }],
                    },
                ],
            }],
        }))

        expect(screen.getByText('Ada')).toBeInTheDocument()
        expect(screen.getByText('Warsaw')).toBeInTheDocument()
    })

    it('isolates a recursive child resolver failure and keeps its sibling rendered', async () => {
        const failure = new Error('broken child')
        configure(({ view, items, label }) => {
            if (view === 'Group') return <section>{items.map(Render)}</section>
            if (view === 'Broken') throw failure
            return <span>{label}</span>
        })
        Render.onError = jest.fn()
        jest.spyOn(console, 'error').mockImplementation(() => {})

        render(Render({
            view: 'Group',
            items: [
                { view: 'Broken', marker: 'failed-node' },
                { view: 'Text', label: 'healthy sibling' },
            ],
        }))

        expect(await screen.findByText(
            '[ui-render] render error at "items[0]" (view "Broken"): Error: broken child'
        )).toBeInTheDocument()
        expect(screen.getByText('healthy sibling')).toBeInTheDocument()
        await waitFor(() => expect(Render.onError).toHaveBeenCalledTimes(1))
        expect(Render.onError).toHaveBeenCalledWith(expect.objectContaining({
            error: failure,
            // The failing node is the first child of the root, and the report says so.
            path: 'items[0]',
            props: expect.objectContaining({ view: 'Broken', marker: 'failed-node' }),
            errorInfo: expect.objectContaining({ componentStack: expect.any(String) }),
        }))
    })

    it('lets child definitions override inherited context without adding absent relative props', () => {
        const component = jest.fn(() => null)
        configure(component)
        const parentData = { source: 'parent' }
        const childData = { source: 'child' }
        const parentForm = { id: 'parent-form' }
        const childForm = { id: 'child-form' }
        const parentInstance = { state: { currencyCode: 'EUR' } }
        const childInstance = { state: { currencyCode: 'GBP' } }

        render(Render({
            view: 'Group',
            data: parentData,
            _data: { scope: 'parent' },
            debug: true,
            form: parentForm,
            instance: parentInstance,
            currencyCode: 'PLN',
            items: [{
                view: 'Text',
                data: childData,
                _data: { scope: 'child' },
                debug: false,
                form: childForm,
                instance: childInstance,
                currencyCode: 'GBP',
            }],
        }))

        const child = component.mock.calls[0][0].items[0]
        expect(child).toEqual(expect.objectContaining({
            data: childData,
            _data: { scope: 'child' },
            debug: false,
            form: childForm,
            instance: childInstance,
            currencyCode: 'GBP',
        }))
        expect(child).not.toHaveProperty('relativeIndex')
        expect(child).not.toHaveProperty('relativePath')
        expect(child).not.toHaveProperty('relativeData')
    })
})
