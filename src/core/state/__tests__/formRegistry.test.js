/**
 * The two registry readers a table's draft row needs: which forms hold a document's data, and which fields
 * show an error the user can fix, and what a document tree tells of its forms' values. Everything else here is
 * exercised through the documents that use it.
 */
import {
    countFormsChange, dataFormsOf, fixableFieldsOf, formsChangeCount, formsOf, formsStorage, holdFixableField,
    listenToTreeValues, tellTreeValues, treeValuesTellsSince, treeValuesVersion,
} from '../formRegistry'

afterEach(() => {
    formsStorage.clear()
})

describe('what the page\'s forms hold, counted', () => {
    it('counts a form registered, registered again, gone, the storage cleared, and new values', () => {
        const key = {}
        const counts = [formsChangeCount()]
        formsStorage.set(key, { form: {}, meta: {}, tree: {}, draftRow: false })
        counts.push(formsChangeCount())
        formsStorage.set(key, { form: {}, meta: { relativeIndex: 1 }, tree: {}, draftRow: false })
        counts.push(formsChangeCount())
        formsStorage.delete(key)
        counts.push(formsChangeCount())
        formsStorage.clear()
        counts.push(formsChangeCount())
        countFormsChange()
        counts.push(formsChangeCount())

        expect(counts.map(count => count - counts[0])).toEqual([0, 1, 2, 3, 4, 5])
        // Still a map of the forms.
        expect(formsStorage).toBeInstanceOf(Map)
    })
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

describe('what a document tree tells of its forms\' values', () => {
    it('tells each form\'s values before and after, and counts its tells', () => {
        const tree = {}
        const form = {}
        const heard = []
        listenToTreeValues(tree, tell => heard.push(tell))

        tellTreeValues(tree, form, { inner: 'a' })
        tellTreeValues(tree, form, { inner: 'b' })
        tellTreeValues(tree, form, undefined)

        expect(heard).toEqual([
            { version: 1, form, previous: undefined, values: { inner: 'a' } },
            { version: 2, form, previous: { inner: 'a' }, values: { inner: 'b' } },
            { version: 3, form, previous: { inner: 'b' }, values: undefined },
        ])
        expect(treeValuesVersion(tree)).toBe(3)
        // A form that registers again after it went held nothing before.
        tellTreeValues(tree, form, { inner: 'c' })
        expect(heard[3].previous).toBeUndefined()
    })

    it('keeps its latest tells for a node that rendered before them', () => {
        const tree = {}
        expect(treeValuesVersion(tree)).toBe(0)
        expect(treeValuesTellsSince(tree, 0)).toEqual([])

        for (let i = 1; i <= 1030; i += 1) tellTreeValues(tree, {}, { i })
        expect(treeValuesTellsSince(tree, 1030)).toEqual([])
        expect(treeValuesTellsSince(tree, 1028).map(tell => tell.version)).toEqual([1029, 1030])
        expect(treeValuesTellsSince(tree, 6)).toHaveLength(1024)
        // Older than it keeps: the node decides again.
        expect(treeValuesTellsSince(tree, 5)).toBeUndefined()
    })

    it('empties its log as the task ends, and still tells what each form held', () => {
        jest.useFakeTimers()
        try {
            const tree = {}
            const form = {}
            const heard = []
            listenToTreeValues(tree, tell => heard.push(tell))
            tellTreeValues(tree, form, { inner: 'a' })
            expect(treeValuesTellsSince(tree, 0)).toHaveLength(1)

            jest.runOnlyPendingTimers()
            expect(treeValuesTellsSince(tree, 0)).toBeUndefined()
            expect(treeValuesTellsSince(tree, 1)).toEqual([])

            tellTreeValues(tree, form, { inner: 'b' })
            expect(heard[1].previous).toEqual({ inner: 'a' })
            expect(treeValuesTellsSince(tree, 1)).toHaveLength(1)
        } finally {
            jest.useRealTimers()
        }
    })

    it('tells its own listeners only, and none that stopped, even while it tells', () => {
        const tree = {}
        const heard = []
        let stopSecond
        listenToTreeValues(tree, () => {
            heard.push('first')
            stopSecond()
        })
        stopSecond = listenToTreeValues(tree, () => heard.push('second'))
        listenToTreeValues({}, () => heard.push('another tree'))

        tellTreeValues(tree, {}, { inner: 'a' })
        expect(heard).toEqual(['first'])
    })
})
