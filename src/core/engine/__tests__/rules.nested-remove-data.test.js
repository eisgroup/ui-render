/**
 * REMOVING A ROW FROM A `Data` BLOCK INSIDE A PARENT ROW REMOVES IT FROM THAT ROW.
 * =============================================================================================
 *
 * The counterpart of `rules.nested-add-data.test.js`. When §9.3 step 2 lifted the `removeData`
 * action into `removeDataKindRow`, the whole suite — 2701 tests — still passed with the block's
 * meta dropped from the call. That turned out to be the registered-path fallback doing its job
 * (`registerDataKind` computes it from the same `relativePath`), but it also showed that no test
 * checked WHICH row a nested remove took. This one does, on the corpus's own `nestedDataKind`.
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

/** The trash button in the row that shows `sku`. */
const removeButtonFor = (container, sku) => {
    const input = Array.from(container.querySelectorAll('input')).find(i => i.value === sku)
    return input.closest('tr').querySelector('button')
}

describe('removeData in a nested Data block', () => {
    it('removes the clicked line from its own parent row, and from no other', async () => {
        const { container, getFormData } = mountExample(example)

        fireEvent.click(removeButtonFor(container, 'DEV-002'))

        await waitFor(() => expect(skus(getFormData().dataKind.phases[1].dataKind.lineItems)).toEqual(['DEV-001', 'DEV-003']))
        const phases = getFormData().dataKind.phases
        expect(skus(phases[0].dataKind.lineItems)).toEqual(['DES-001', 'DES-002'])
        expect(skus(phases[2].dataKind.lineItems)).toEqual(['QA-001'])
        expect(Object.keys(getFormData().dataKind)).toEqual(['phases'])
    })

    it('removes the right line again once the rows have re-indexed', async () => {
        // The action reads the row index at click time, and the comment it carried says an index
        // captured when `config` was first read would take the wrong row once siblings shift. That
        // could NOT be reproduced here: rows are keyed by position, so each instance's captured
        // index stays right, and a mutant capturing it at config time passes this test. The test
        // shows only that a second removal after re-indexing is correct.
        const { container, getFormData } = mountExample(example)

        fireEvent.click(removeButtonFor(container, 'DEV-001'))
        await waitFor(() => expect(skus(getFormData().dataKind.phases[1].dataKind.lineItems)).toEqual(['DEV-002', 'DEV-003']))

        fireEvent.click(removeButtonFor(container, 'DEV-003'))
        await waitFor(() => expect(skus(getFormData().dataKind.phases[1].dataKind.lineItems)).toEqual(['DEV-002']))
    })
})
