/**
 * THE PUBLIC onError REPORT HOOK ==============================================
 *
 * UPGRADE-PLAN §9.4 / §2.6-3, end to end: a real meta document, a real render
 * failure, and the report a host receives for it. The boundary's own contracts
 * are unit-tested in src/core/ui-render/__tests__/Render.error-reporting.test.js;
 * what this suite adds is that the prop is wired through the engine at all, and
 * that a failure inside one node leaves the rest of the document standing.
 *
 * The failure used here is a measured one, not a contrived throw: `headers` that
 * is not an array makes the table component call `.map` on a string. It is also
 * exactly what the dev-mode meta validator reports as an `error` severity, so
 * the two halves of §9.4 describe the same defect from both ends.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../../contexts'
import { Render } from '../../../ui-render'
import UIRender from '../rules'

const data = { orders: [{ id: 1 }] }
const meta = {
    view: 'Col',
    items: [
        { view: 'Text', name: 'label' },
        { view: 'Table', name: 'orders', headers: 'not-an-array' },
    ],
}

describe('UIRender onError prop', () => {
    const originalOnError = Render.onError
    const originalFetch = global.fetch
    let consoleError

    beforeEach(() => {
        // The library's own sink is silenced here so the assertions are about the host
        // channel; that the sink itself reports is mapper.error-sink.test.js's job.
        Render.onError = () => {}
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
    })

    afterEach(() => {
        Render.onError = originalOnError
        consoleError.mockRestore()
        if (originalFetch === undefined) delete global.fetch
        else global.fetch = originalFetch
    })

    const mount = props => render(
        <ConfigContext.Provider value={initialConfigState}>
            <UIRender data={{ ...data, label: 'still here' }} meta={meta} {...props} />
        </ConfigContext.Provider>
    )

    it('reports a failing node to the host with the meta path that identifies it', () => {
        const reports = []

        mount({ onError: report => reports.push(report) })

        expect(reports).toHaveLength(1)
        const [report] = reports
        expect(report.error).toBeInstanceOf(TypeError)
        expect(report.path).toBe('items[1]')
        expect(report.message).toContain('items[1]')
        expect(report.message).toContain('view "Table"')
        expect(report.message).toContain('name "orders"')
        expect(report.errorInfo.componentStack).toEqual(expect.any(String))
        // The rest of the document still renders, and the failed node is replaced by the
        // diagnostic rather than by an empty space.
        expect(screen.getByText('still here')).toBeInTheDocument()
        expect(screen.getByText(report.message)).toBeInTheDocument()
    })

    it('renders unchanged when the host passes no hook', () => {
        mount({})

        expect(screen.getByText('still here')).toBeInTheDocument()
        expect(screen.getByText(/render error at "items\[1\]"/)).toBeInTheDocument()
    })
})
