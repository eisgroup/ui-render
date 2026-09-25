/**
 * ADDING A ROW TO A `Data` BLOCK INSIDE A PARENT ROW LANDS IN THAT ROW.
 * =============================================================================================
 *
 * The `addData` action resolves where the new row goes from the block's `relativePath` — at the
 * root that is `dataKind.{kind}`, inside a parent row it is `<row>.dataKind.{kind}`. Until §9.3
 * step 2 measured it, the second case ran NOWHERE in the suite: the one end-to-end add was a root
 * block, so the branch that picks a parent row was covered by nothing. `dataKindPathFor` now has
 * direct tests; this proves the engine hands it the right path.
 *
 * It drives the corpus's own arrangement, the `nestedDataKind` example, rather than a meta written
 * for the test: the nested table sits in the parent row's expanded `renderItem`, and its draft row
 * is a `renderExtraItem` with `relativeData: false`. A nested table placed in the row's CELLS
 * instead was tried while measuring this, and the add does not work there at all — which is not
 * the pattern the corpus uses, and not what this file claims anything about.
 */
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import { fireEvent, waitFor } from '@testing-library/react' // eslint-disable-line import/first
import { EXAMPLES } from '../../../demo/examples/manifest' // eslint-disable-line import/first
import { mountExample } from '../../../demo/testing/mountExample' // eslint-disable-line import/first

const example = EXAMPLES.find(({ id }) => id === 'nestedDataKind')

const skus = rows => (rows || []).map(row => row.sku)

/** The draft rows' own inputs are unprefixed (`relativeData: false`), one draft per phase. */
const draftRow = (container, phaseIndex) =>
    Array.from(container.querySelectorAll('input[name="sku"]'))[phaseIndex].closest('tr')

describe('addData in a nested Data block', () => {
    it('appends the draft to its own parent row, and to no other', async () => {
        const { container, getFormData } = mountExample(example)
        const before = example.data.dataKind.phases.map(phase => skus(phase.dataKind.lineItems))

        const row = draftRow(container, 1)
        const fill = { sku: 'NEW-1', description: 'Added line', qty: '2', unitPrice: '50' }
        row.querySelectorAll('input').forEach(input => {
            const value = fill[input.getAttribute('name')]
            if (value != null) fireEvent.change(input, { target: { value } })
        })
        fireEvent.click(Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Add line')))

        await waitFor(() => expect(getFormData().dataKind.phases[1].dataKind.lineItems).toHaveLength(4))
        const phases = getFormData().dataKind.phases
        expect(phases[1].dataKind.lineItems[3]).toEqual({ sku: 'NEW-1', description: 'Added line', qty: 2, unitPrice: 50 })
        expect(skus(phases[0].dataKind.lineItems)).toEqual(before[0])
        expect(skus(phases[2].dataKind.lineItems)).toEqual(before[2])
        // Nothing leaked to a root-level `dataKind.lineItems`.
        expect(Object.keys(getFormData().dataKind)).toEqual(['phases'])
    })

    it('clears the draft it added', async () => {
        const { container, getFormData } = mountExample(example)

        const row = draftRow(container, 2)
        const fill = { sku: 'NEW-2', qty: '1' }
        row.querySelectorAll('input').forEach(input => {
            const value = fill[input.getAttribute('name')]
            if (value != null) fireEvent.change(input, { target: { value } })
        })
        fireEvent.click(Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Add line')))

        await waitFor(() => expect(skus(getFormData().dataKind.phases[2].dataKind.lineItems)).toEqual(['QA-001', 'NEW-2']))
        expect(Array.from(container.querySelectorAll('input[name="sku"]')).map(input => input.value)).toEqual(['', '', ''])
    })
})
