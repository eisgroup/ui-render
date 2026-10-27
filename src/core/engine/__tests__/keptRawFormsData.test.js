/**
 * `keptRawFormsData` (2026-10-26): a document tree's forms are merged once while what the page's forms hold stays the
 * same, for every `showIf` of the tree that reads them. The merges are counted where they are made, `getRawFormsData`.
 */
import { keptRawFormsData } from '../keptRawFormsData'
import { countFormsChange, formsStorage } from '../../state/formRegistry'
import { createBatchedForm, registrationsOf } from '../../modules/form/batchedForm'

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

/** A form as the merge reads it, with the fields it registers, and its registration in `tree`. */
function register (tree, values, meta = {}, fields = []) {
    const form = { values, getState: () => ({ values: form.values }), getRegisteredFields: () => fields }
    const key = {}
    formsStorage.set(key, { form, meta, tree, draftRow: false })
    return { form, key }
}

/** A form `createBatchedForm` makes, registered in `tree`, and a field registered with it as a field's effect does. */
function registerBatched (tree, values, meta = {}) {
    const form = createBatchedForm({ initialValues: values, onSubmit: () => undefined })
    formsStorage.set({}, { form, meta, tree, draftRow: false })
    return form
}
const field = (form, name) => form.registerField(name, () => undefined, { value: true })

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
        const { form, key } = register(tree, { items: [{ kind: 'as loaded' }, undefined] }, { relativePath: 'items', relativeIndex: 0 }, ['items[0].kind', 'items[1].kind'])
        register(tree, { items: [{ kind: 'as loaded' }, { kind: 'second' }] })
        expect(keptRawFormsData(tree)).toEqual({ items: [{ kind: 'as loaded' }, { kind: 'second' }] })

        form.values = { items: [undefined, { kind: 'moved' }] }
        formsStorage.delete(key)
        formsStorage.set({}, { form, meta: { relativePath: 'items', relativeIndex: 1 }, tree, draftRow: false })

        expect(keptRawFormsData(tree)).toEqual({ items: [{ kind: 'as loaded' }, { kind: 'moved' }] })
        expect(mockMerges.count).toBe(2)
    })

    describe('a field that comes to a table row\'s own form, with no new values', () => {
        // A merge reads a row's form by its fields' names (`fieldNamesOf`, 2026-10-27), and a field registers with no
        // change of what the forms hold: one a `showIf` in the row's cells shows, say.
        const row = { relativePath: 'items', relativeIndex: 0 }

        it('keeps the merge where the field holds what the merge holds there, as it does when it comes', () => {
            const tree = {}
            registerBatched(tree, { title: 'T', items: [{ kind: 'a', detail: 'x' }] })
            const rowForm = registerBatched(tree, { items: [{ kind: 'a', detail: 'x' }] }, row)
            field(rowForm, 'items[0].kind')
            const first = keptRawFormsData(tree)

            field(rowForm, 'items[0].detail')

            expect(keptRawFormsData(tree)).toBe(first)
            expect(mockMerges.count).toBe(1)
        })

        it('merges again where the field holds another value, which another form edited in the merge', () => {
            const tree = {}
            registerBatched(tree, { title: 'T', items: [{ kind: 'a', detail: 'typed in the document' }] })
            const rowForm = registerBatched(tree, { items: [{ kind: 'a', detail: 'the row\'s' }] }, row)
            field(rowForm, 'items[0].kind')
            expect(keptRawFormsData(tree).items[0].detail).toBe('typed in the document')

            field(rowForm, 'items[0].detail')

            expect(keptRawFormsData(tree).items[0].detail).toBe('the row\'s')
            expect(mockMerges.count).toBe(2)
        })

        it('merges again at once where the field comes inside a bracket, before validation resumes', () => {
            const tree = {}
            registerBatched(tree, { title: 'T', items: [{ kind: 'a', detail: 'typed in the document' }] })
            const rowForm = registerBatched(tree, { items: [{ kind: 'a', detail: 'the row\'s' }] }, row)
            keptRawFormsData(tree)

            registrationsOf(rowForm).begin()
            field(rowForm, 'items[0].detail')

            expect(keptRawFormsData(tree).items[0].detail).toBe('the row\'s')
            registrationsOf(rowForm).end()
            expect(mockMerges.count).toBe(2)
        })

        it('keeps the merge where a field comes to a document\'s form, which is merged whole', () => {
            const tree = {}
            const document = registerBatched(tree, { title: 'T', items: [{ kind: 'a' }] })
            const first = keptRawFormsData(tree)

            field(document, 'title')

            expect(keptRawFormsData(tree)).toBe(first)
            expect(mockMerges.count).toBe(1)
        })
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
