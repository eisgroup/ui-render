/**
 * A MISCONFIGURED `Table.group` SAYS WHAT IS WRONG.
 * =============================================================================================
 *
 * Its three checks used to open a popup through `popup.setPopupState`, read off a context key that
 * does not exist, so each threw a TypeError and the node's error boundary rendered THAT. Found by the
 * TypeScript checker. The checks throw their own message now, and the boundary renders it.
 */
if (typeof global.fetch === 'undefined') {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { act, render } from '@testing-library/react' // eslint-disable-line import/first
import PublishedUIRender from '../../../library/main' // eslint-disable-line import/first
import { clearEngineGlobals } from '../../../demo/testing/mountExample' // eslint-disable-line import/first

const data = { rows: [{ band: 'a', level: 1, amount: 3 }] }

async function diagnosticFor (group) {
    clearEngineGlobals()
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
        const meta = { view: 'Table', name: 'rows', headers: [{ id: 'amount', label: 'Amount' }], group }
        const { container } = render(<PublishedUIRender meta={meta} data={data} initialValues={data} onSubmit={() => {}}/>)
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
        return container.textContent
    } finally {
        error.mockRestore()
        warn.mockRestore()
    }
}

describe('a misconfigured Table.group', () => {
    it('names a missing `by.id` in the diagnostic', async () => {
        const text = await diagnosticFor({ header: { id: 'band' } })
        expect(text).toContain('Incorrect config for Table with {name: "rows"}! Table.group.by must have \'id\'')
        expect(text).not.toContain('setPopupState')
    })

    it('names a missing `header.id` in the diagnostic', async () => {
        const text = await diagnosticFor({ by: { id: 'level' } })
        expect(text).toContain('Table.group.header must have \'id\'')
        expect(text).not.toContain('setPopupState')
    })

    it('names a `by.label` that is not an object of labels', async () => {
        const text = await diagnosticFor({ by: { id: 'level', label: 'not an object' }, header: { id: 'band' } })
        expect(text).toContain('Table.group.by.label must resolve to object of labels by level')
        expect(text).not.toContain('setPopupState')
    })
})
