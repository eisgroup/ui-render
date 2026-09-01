/**
 * PUBLIC ENTRY WIRING FOR DEV-MODE META VALIDATION ============================
 *
 * UPGRADE-PLAN §9.4 item 2. The validator itself is covered by
 * src/core/ui-render/__tests__/validateMeta.contract.test.js; this suite covers
 * the only thing that turns it on — the `validateMeta` prop on the published
 * entry — and the three properties a host is entitled to rely on:
 *
 *   1. OFF BY DEFAULT AND FULLY INERT. Nothing is walked, nothing is logged. This
 *      is also why the rest of the suite is unaffected: several suites assert an
 *      exact `console.error` allowlist, and one asserts full-DOM snapshots.
 *   2. VALIDATION HAPPENS DURING RENDER, BEFORE UIRender RUNS. The failures worth
 *      naming throw inside UIRender's own render pass, so a post-commit effect
 *      would report after the crash it was meant to explain.
 *   3. THE FLAG IS NOT A COMPONENT PROP. It is consumed here and never forwarded.
 *
 * `rules` is mocked, as in library.public-api-and-wrapper.test.js: the point is
 * the plumbing, and a real UIRender would render (or crash on) the meta.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { render } from '@testing-library/react'

const uiRenderCalls = []

jest.mock('../../core/pages/main/rules', () => {
    const ReactModule = require('react')

    return function MockUIRender (props) {
        uiRenderCalls.push(props)
        return ReactModule.createElement('output', { 'data-testid': 'ui-render' })
    }
})

import LibraryRender from '../main' // eslint-disable-line import/first

const VALID_META = { view: 'Col', items: [{ view: 'Text', name: 'label' }] }
const BROKEN_META = { view: 'Col', items: [{ view: 'Row', items: { view: 'Text' } }] }

describe('validateMeta prop on the published entry', () => {
    let consoleWarn

    beforeEach(() => {
        uiRenderCalls.length = 0
        consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleWarn.mockRestore()
    })

    it('is off by default: broken meta produces no output at all', () => {
        render(<LibraryRender data={{}} meta={BROKEN_META}/>)

        expect(consoleWarn).not.toHaveBeenCalled()
    })

    it.each([[false], [undefined]])('stays silent when explicitly passed %p', (flag) => {
        render(<LibraryRender data={{}} meta={BROKEN_META} validateMeta={flag}/>)

        expect(consoleWarn).not.toHaveBeenCalled()
    })

    it('reports the JSON path of the offending node when enabled', () => {
        render(<LibraryRender data={{}} meta={BROKEN_META} validateMeta/>)

        expect(consoleWarn).toHaveBeenCalledTimes(1)
        expect(consoleWarn.mock.calls[0][0]).toContain('items[0].items')
        expect(consoleWarn.mock.calls[0][0]).toContain('must be an array')
    })

    it('stays silent on valid meta when enabled', () => {
        render(<LibraryRender data={{}} meta={VALID_META} validateMeta/>)

        expect(consoleWarn).not.toHaveBeenCalled()
    })

    it('routes problems to a host-supplied function instead of the console', () => {
        const reported = []
        // A plain function, not jest.fn(): isFunction() in core/utils rejects cross-realm functions.
        render(<LibraryRender data={{}} meta={BROKEN_META} validateMeta={(problems) => reported.push(problems)}/>)

        expect(reported).toHaveLength(1)
        expect(reported[0][0]).toMatchObject({ path: 'items[0].items', severity: 'error' })
        expect(consoleWarn).not.toHaveBeenCalled()
    })

    it('validates before UIRender renders, and once per meta identity', () => {
        const order = []
        // Stable reference: the memo is keyed on the meta identity AND the flag value, so an
        // inline arrow would be a new flag on every render and would re-walk each time.
        const sink = () => order.push('validated')
        uiRenderCalls.length = 0
        const { rerender } = render(<LibraryRender data={{}} meta={BROKEN_META} validateMeta={sink}/>)

        expect(order).toEqual(['validated'])
        expect(uiRenderCalls).toHaveLength(1)

        // Same meta object, new render: memoised, so no second walk.
        rerender(<LibraryRender data={{ changed: true }} meta={BROKEN_META} validateMeta={sink}/>)
        expect(order).toEqual(['validated'])

        // A different meta object is a new document and is walked again.
        rerender(<LibraryRender data={{}} meta={{ ...BROKEN_META }} validateMeta={sink}/>)
        expect(order).toEqual(['validated', 'validated'])
    })

    it('does not forward the flag to UIRender', () => {
        render(<LibraryRender data={{ a: 1 }} meta={VALID_META} validateMeta translate={value => value}/>)

        expect(uiRenderCalls).toHaveLength(1)
        expect(uiRenderCalls[0]).not.toHaveProperty('validateMeta')
        expect(uiRenderCalls[0].meta).toBe(VALID_META)
        expect(uiRenderCalls[0].data).toEqual({ a: 1 })
    })

    it('tolerates a missing meta', () => {
        render(<LibraryRender validateMeta/>)

        expect(consoleWarn).toHaveBeenCalledTimes(1)
        expect(consoleWarn.mock.calls[0][0]).toContain('(root)')
    })
})
