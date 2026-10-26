/**
 * `keptRawFormsData` (2026-10-26): a document tree's forms are merged once while what the page's forms hold stays the
 * same, for every `showIf` of the tree that reads them. The merges are counted where they are made, `getRawFormsData`.
 */
import { keptRawFormsData } from '../keptRawFormsData'
import { countFormsChange, formsStorage } from '../../state/formRegistry'

const mockMerges = { count: 0 }
jest.mock('../formData', () => {
    const actual = jest.requireActual('../formData')
    return {
        ...actual,
        getRawFormsData: forms => {
            mockMerges.count += 1
            return actual.getRawFormsData(forms)
        },
    }
})

beforeEach(() => {
    mockMerges.count = 0
})

afterEach(() => {
    formsStorage.clear()
})

/** A form as the merge reads it, and its registration in `tree`. */
function register (tree, values, meta = {}) {
    const form = { values, getState: () => ({ values: form.values }) }
    const key = {}
    formsStorage.set(key, { form, meta, tree, draftRow: false })
    return { form, key }
}

describe('keptRawFormsData', () => {
    it('merges a tree\'s forms once while they hold the same, and gives every call that merge', () => {
        const tree = {}
        register(tree, { flag: 'yes' })

        const first = keptRawFormsData(tree)
        const second = keptRawFormsData(tree)

        expect(first).toEqual({ flag: 'yes' })
        expect(second).toBe(first)
        expect(mockMerges.count).toBe(1)
    })

    it('merges again once a form\'s values change', () => {
        const tree = {}
        const { form } = register(tree, { flag: 'yes' })
        keptRawFormsData(tree)

        form.values = { flag: 'no' }
        countFormsChange()

        expect(keptRawFormsData(tree)).toEqual({ flag: 'no' })
        expect(mockMerges.count).toBe(2)
    })

    it('merges again once a form registers again, with no new values told', () => {
        // A form that new initial values reset registers again, with the meta of the render that brought them.
        const tree = {}
        const { form, key } = register(tree, { items: [{ kind: 'as loaded' }, undefined] }, { relativePath: 'items', relativeIndex: 0 })
        register(tree, { items: [{ kind: 'as loaded' }, { kind: 'second' }] })
        expect(keptRawFormsData(tree)).toEqual({ items: [{ kind: 'as loaded' }, { kind: 'second' }] })

        form.values = { items: [undefined, { kind: 'moved' }] }
        formsStorage.delete(key)
        formsStorage.set({}, { form, meta: { relativePath: 'items', relativeIndex: 1 }, tree, draftRow: false })

        expect(keptRawFormsData(tree)).toEqual({ items: [{ kind: 'as loaded' }, { kind: 'moved' }] })
        expect(mockMerges.count).toBe(2)
    })

    it('keeps a merge per tree', () => {
        const one = {}
        const other = {}
        register(one, { flag: 'one' })
        register(other, { flag: 'other' })

        expect([keptRawFormsData(one), keptRawFormsData(other), keptRawFormsData(one)])
            .toEqual([{ flag: 'one' }, { flag: 'other' }, { flag: 'one' }])
        expect(mockMerges.count).toBe(2)
    })

    it('merges nothing for a document that belongs to no tree', () => {
        register({}, { flag: 'yes' })

        expect(keptRawFormsData(undefined)).toBeUndefined()
        expect(mockMerges.count).toBe(0)
    })
})
