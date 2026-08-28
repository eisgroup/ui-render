/**
 * PER-NODE ERROR REPORTING ====================================================
 *
 * UPGRADE-PLAN §9.4 / §2.6-3. The boundary itself is old (`RenderClass` has had
 * `componentDidCatch` for years); what was broken is everything downstream of
 * it — the report was unreadable (`String(error)` with no idea WHICH node), and
 * the production sink in `mapper.js` destructured `{err, errInfo}` while the
 * boundary emitted `{error, errorInfo}`, so every report carried `undefined`.
 *
 * These tests pin the repaired contract:
 *   - the report names the meta path of the node whose subtree failed;
 *   - the inline diagnostic rendered in place of the failed node names it too;
 *   - a host `onError` prop is called with the same report;
 *   - a host reporter that itself throws cannot take the application down.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Render, { formatRenderError } from '../Render'

const originalOnError = Render.onError

// A resolver that recurses through `items` and throws for `view: 'Broken'` — the
// smallest engine that can produce a nested failure at a known meta path.
const configure = () => {
    Render.Component = ({ view, items, label }) => {
        if (view === 'Broken') throw new Error('boom')
        if (items && items.length) return <section>{items.map(Render)}</section>
        return <span>{label}</span>
    }
    Render.Method = () => () => null
}

const reports = []

describe('Render error reporting', () => {
    beforeEach(() => {
        reports.length = 0
        Render.onError = report => reports.push(report)
        jest.spyOn(console, 'error').mockImplementation(() => {})
        configure()
    })

    afterEach(() => {
        Render.Component = undefined
        Render.Method = undefined
        Render.onError = originalOnError
        jest.restoreAllMocks()
    })

    it('names the meta path of the failing node, counted from the document root', async () => {
        render(Render({
            view: 'Col',
            items: [
                { view: 'Text', label: 'healthy' },
                { view: 'Col', items: [{ view: 'Broken' }] },
            ],
        }))

        await waitFor(() => expect(reports).toHaveLength(1))
        expect(reports[0]).toEqual(expect.objectContaining({
            path: 'items[1].items[0]',
            error: expect.objectContaining({ message: 'boom' }),
            errorInfo: expect.objectContaining({ componentStack: expect.any(String) }),
            props: expect.objectContaining({ view: 'Broken' }),
        }))
        // The sibling still renders: one bad node does not take the document with it.
        expect(screen.getByText('healthy')).toBeInTheDocument()
    })

    it('reports the document root as the root, not as an unknown position', async () => {
        render(Render({ view: 'Broken' }))

        await waitFor(() => expect(reports).toHaveLength(1))
        expect(reports[0].path).toBe('')
        expect(reports[0].message).toContain('the meta root')
    })

    it('renders a diagnostic naming the node in place of the failed subtree', async () => {
        render(Render({
            view: 'Col',
            items: [{ view: 'Broken', name: 'customer.age' }],
        }))

        expect(await screen.findByText(
            '[ui-render] render error at "items[0]" (view "Broken", name "customer.age"): Error: boom'
        )).toBeInTheDocument()
    })

    it('hands the same report to the host onError prop', async () => {
        const hostReports = []
        const instance = { props: { onError: report => hostReports.push(report) }, state: {} }

        render(Render({ view: 'Col', instance, items: [{ view: 'Broken' }] }))

        await waitFor(() => expect(hostReports).toHaveLength(1))
        expect(hostReports[0].path).toBe('items[0]')
        expect(hostReports[0].error.message).toBe('boom')
        // The library's own sink still runs, so a host hook adds a channel rather
        // than silencing the diagnostic.
        expect(reports).toHaveLength(1)
    })

    it('survives a host onError that throws, and still reports through its own sink', async () => {
        const instance = {
            props: { onError: () => { throw new Error('reporter is broken') } },
            state: {},
        }

        render(Render({ view: 'Col', instance, items: [{ view: 'Broken' }] }))

        await waitFor(() => expect(reports).toHaveLength(1))
        expect(reports[0].error.message).toBe('boom')
        expect(await screen.findByText(/render error at "items\[0\]"/)).toBeInTheDocument()
    })

    it('ignores an onError that is not a function', async () => {
        const instance = { props: { onError: 'log it please' }, state: {} }

        render(Render({ view: 'Col', instance, items: [{ view: 'Broken' }] }))

        await waitFor(() => expect(reports).toHaveLength(1))
    })

    describe('formatRenderError', () => {
        it('names the path, the view and the data binding when meta declares them', () => {
            expect(formatRenderError({
                error: new TypeError('items.map is not a function'),
                path: 'items[2]',
                props: { view: 'Table', name: 'orders' },
            })).toBe(
                '[ui-render] render error at "items[2]" (view "Table", name "orders"):'
                + ' TypeError: items.map is not a function'
            )
        })

        it('falls back to the bare position when the node declares neither', () => {
            expect(formatRenderError({ error: new Error('boom'), path: '' }))
                .toBe('[ui-render] render error at the meta root: Error: boom')
        })
    })
})
