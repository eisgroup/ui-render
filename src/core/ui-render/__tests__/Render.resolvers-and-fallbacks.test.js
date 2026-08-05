import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Render from '../Render'

const defaultOnError = Render.onError

describe('Render setup and fallback contracts', () => {
    afterEach(() => {
        Render.Component = undefined
        Render.Method = undefined
        Render.Tooltip = undefined
        Render.onError = defaultOnError
        jest.restoreAllMocks()
    })

    it('reports a missing method resolver separately from a configured component resolver', () => {
        Render.Component = jest.fn(() => null)
        Render.Method = undefined
        jest.spyOn(console, 'error').mockImplementation(() => {})

        expect(() => render(Render({ view: 'Text', items: [] }))).toThrow(
            'Please setup Render.Method mapper first'
        )
    })

    it('uses the default error reporter when a mapped component throws', async () => {
        const failure = new Error('default reporter failure')
        Render.Component = () => {
            throw failure
        }
        Render.Method = jest.fn(() => null)
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})

        render(Render({ view: 'Broken', data: { id: 9 } }))

        expect(await screen.findByText('Error: default reporter failure')).toBeInTheDocument()
        await waitFor(() => expect(consoleWarn).toHaveBeenCalledTimes(1))
        expect(consoleWarn).toHaveBeenCalledWith(
            'Unhandled Render error:',
            expect.objectContaining({
                error: failure,
                props: expect.objectContaining({ view: 'Broken', data: { id: 9 } }),
            })
        )
        expect(consoleError).toHaveBeenCalled()
    })

    it('supplies default items and stable keys for list render calls', () => {
        Render.Component = jest.fn(() => null)
        Render.Method = jest.fn(() => null)

        const indexed = Render({ view: 'Text' }, 3)
        const objectIndex = Render({ view: 'Text' }, { id: 3 })
        render(indexed)

        expect(indexed.key).toBe('3')
        expect(objectIndex.key).toBeNull()
        expect(Render.Component).toHaveBeenCalledWith(
            expect.objectContaining({ items: [] }),
            expect.anything()
        )
    })
})
