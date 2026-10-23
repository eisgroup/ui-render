/**
 * The two registry readers a table's draft row needs: which forms hold a document's data, and which fields
 * show an error the user can fix. Everything else here is exercised through the documents that use it.
 */
import { dataFormsOf, fixableFieldsOf, formsOf, formsStorage, holdFixableField } from '../formRegistry'

afterEach(() => {
    formsStorage.clear()
})

describe('dataFormsOf', () => {
    it('is the forms of the tree but a table\'s draft row\'s', () => {
        const tree = {}
        const root = { form: {}, meta: {}, tree, draftRow: false }
        const draft = { form: {}, meta: {}, tree, draftRow: true }
        const elsewhere = { form: {}, meta: {}, tree: {}, draftRow: false }
        formsStorage.set({}, draft)
        formsStorage.set({}, root)
        formsStorage.set({}, elsewhere)

        expect([...dataFormsOf(tree).values()]).toEqual([root])
        // The forms a host hears the errors of are still all of the tree's.
        expect([...formsOf(tree).values()]).toEqual([draft, root])
        expect(formsStorage.size).toBe(3)
    })

    it('is empty for a document that belongs to no tree', () => {
        formsStorage.set({}, { form: {}, meta: {}, tree: {}, draftRow: false })

        expect(dataFormsOf(undefined).size).toBe(0)
    })
})

describe('the fields whose error the user can fix', () => {
    it('are none for a form nothing counted a field in', () => {
        expect(fixableFieldsOf({}).size).toBe(0)
    })

    it('are counted per form and per mounted field, and go when the last of a name is uncounted', () => {
        const form = {}
        const other = {}
        const first = holdFixableField(form, 'weight')
        const second = holdFixableField(form, 'weight')
        holdFixableField(other, 'weight')

        expect([...fixableFieldsOf(form)]).toEqual([['weight', 2]])
        first()
        expect([...fixableFieldsOf(form)]).toEqual([['weight', 1]])
        second()
        expect(fixableFieldsOf(form).has('weight')).toBe(false)
        expect([...fixableFieldsOf(other)]).toEqual([['weight', 1]])
    })
})
