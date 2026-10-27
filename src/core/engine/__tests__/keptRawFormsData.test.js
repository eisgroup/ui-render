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
function registerBatched (tree, values, meta = {}, wholeDocument = false) {
    const form = createBatchedForm({ initialValues: values, onSubmit: () => undefined })
    formsStorage.set({}, { form, meta, tree, draftRow: false, wholeDocument })
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
        // change of what the forms hold: one a `showIf` in the row's cells shows, say. It writes its value only where
        // the form changed it.
        const row = { relativePath: 'items', relativeIndex: 0 }
        /** The row's form, which has changed its `detail` while no field of that name was there. */
        const changedRowForm = tree => {
            const rowForm = registerBatched(tree, { items: [{ kind: 'a', detail: 'as loaded' }] }, row)
            // What the document's form does: a subscriber to the values, which counts their changes.
            rowForm.subscribe(() => undefined, { values: true })
            field(rowForm, 'items[0].kind')
            rowForm.change('items[0].detail', 'typed in the row')
            return rowForm
        }

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

        it('keeps the merge where the field\'s form did not change it, whatever another form edited there', () => {
            const tree = {}
            registerBatched(tree, { title: 'T', items: [{ kind: 'a', detail: 'typed in the document' }] })
            const rowForm = registerBatched(tree, { items: [{ kind: 'a', detail: 'as loaded' }] }, row)
            field(rowForm, 'items[0].kind')
            const first = keptRawFormsData(tree)

            field(rowForm, 'items[0].detail')

            expect(keptRawFormsData(tree)).toBe(first)
            expect(first.items[0].detail).toBe('typed in the document')
            expect(mockMerges.count).toBe(1)
        })

        it('merges again where its form changed the field to another value than the merge holds', () => {
            const tree = {}
            registerBatched(tree, { title: 'T', items: [{ kind: 'a', detail: 'typed in the document' }] })
            const rowForm = changedRowForm(tree)
            expect(keptRawFormsData(tree).items[0].detail).toBe('typed in the document')
            const merges = mockMerges.count

            field(rowForm, 'items[0].detail')

            expect(keptRawFormsData(tree).items[0].detail).toBe('typed in the row')
            expect(mockMerges.count).toBe(merges + 1)
        })

        it('merges again at once where the field comes inside a bracket, before validation resumes', () => {
            const tree = {}
            registerBatched(tree, { title: 'T', items: [{ kind: 'a', detail: 'typed in the document' }] })
            const rowForm = changedRowForm(tree)
            keptRawFormsData(tree)
            const merges = mockMerges.count

            registrationsOf(rowForm).begin()
            field(rowForm, 'items[0].detail')

            expect(keptRawFormsData(tree).items[0].detail).toBe('typed in the row')
            registrationsOf(rowForm).end()
            expect(mockMerges.count).toBe(merges + 1)
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

    describe('a field that comes to a form that holds the whole document, beside another', () => {
        // A `useForm` block's form that selects no values holds the whole document, as the document's own form does, and
        // each gives a merge the fields it changed (`mergeDocuments`, 2026-10-27). A block registers first.

        it('merges again where the form changed the field to another value than the merge holds', () => {
            const tree = {}
            const block = registerBatched(tree, { title: 'T', note: 'n' }, {}, true)
            registerBatched(tree, { title: 'T', note: 'n' }, {}, true)
            block.subscribe(() => undefined, { values: true })
            block.change('title', 'U')
            expect(keptRawFormsData(tree).title).toBe('T')
            const merges = mockMerges.count

            field(block, 'title')

            expect(keptRawFormsData(tree).title).toBe('U')
            expect(mockMerges.count).toBe(merges + 1)
        })

        it('keeps the merge where the field holds what the merge holds there', () => {
            const tree = {}
            const block = registerBatched(tree, { title: 'T', note: 'n' }, {}, true)
            // A nested document's form, which a `relativePath` places: it holds no whole document.
            registerBatched(tree, { note: 'n' }, { relativePath: 'section' })
            registerBatched(tree, { title: 'T', note: 'n' }, {}, true)
            const first = keptRawFormsData(tree)

            field(block, 'title')

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
