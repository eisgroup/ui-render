/**
 * WHICH ROW A POPUP BELONGS TO.
 * =============================================================================================
 *
 * `POPUP_OPEN` resolves a row index, row data and array path before it interpolates a popup id, and
 * until §9.3 step 2 that decision was sixty lines inside a three-hundred-line handler, reachable
 * only by clicking a button in a rendered table.
 *
 * The four sources are written down here for what each one does, including the ones that a
 * measurement over the whole suite found never fire — see the note on the last describe block.
 */
import { resolvePopupScope } from '../popupScope'

const formWith = values => ({ getState: () => ({ values }) })

describe('a popup id that already carries its row index', () => {
    it('takes the index from the id and asks no further source', () => {
        const scope = resolvePopupScope({
            id: 'edit.2',
            form: formWith({ 'rows[1]': {} }),
            props: { relativeIndex: 7, relativePath: 'other' },
        })

        expect(scope.relativeIndex).toBe(2)
        // The later sources are `else if` on a null index, so none of them ran.
        expect(scope.relativeData).toBeNull()
        expect(scope.relativePath).toBeNull()
    })

    it('ignores a trailing group that is not a number', () => {
        expect(resolvePopupScope({ id: 'edit.summary', props: {} }).relativeIndex).toBeNull()
    })
})

describe('the four sources, in the order they are tried', () => {
    it('1 — the row the node itself was rendered in', () => {
        const scope = resolvePopupScope({
            id: 'edit',
            props: { relativeIndex: 3, _data: { note: 'row three' }, relativePath: 'rows' },
        })

        expect(scope).toEqual({ relativeIndex: 3, relativeData: { note: 'row three' }, relativePath: 'rows' })
    })

    it('2 — the node index plus the live form values', () => {
        const values = { rows: [{}, {}] }
        const scope = resolvePopupScope({
            id: 'edit',
            form: formWith(values),
            props: { index: 1, relativePath: 'rows' },
        })

        expect(scope).toEqual({ relativeIndex: 1, relativeData: values, relativePath: 'rows' })
    })

    it('3 — an index written into the path, which is then stripped from it', () => {
        const values = { orders: {} }
        const scope = resolvePopupScope({
            id: 'edit',
            form: formWith(values),
            props: { relativePath: 'orders.lines[4]' },
        })

        expect(scope).toEqual({ relativeIndex: 4, relativeData: values, relativePath: 'orders.lines' })
    })

    it('3 — a path with no index keeps the path and leaves the index unresolved', () => {
        const scope = resolvePopupScope({
            id: 'edit',
            form: formWith({}),
            props: { relativePath: 'orders' },
        })

        expect(scope.relativeIndex).toBeNull()
        expect(scope.relativePath).toBe('orders')
    })

    it('4 — the first form field name that carries a bracketed index', () => {
        const values = { plain: 1, 'rows[2]': {}, 'later[9]': {} }
        const scope = resolvePopupScope({ id: 'edit', form: formWith(values), props: {} })

        expect(scope).toEqual({ relativeIndex: 2, relativeData: values, relativePath: 'rows' })
    })

    it('4 — with nothing bracketed to find, only the form values come back', () => {
        // THE CASE THAT ACTUALLY HAPPENS. final-form nests a bracketed name into a real array, so a
        // top-level values key cannot contain `[` — this branch fires and never matches. Measured
        // over the whole suite: sources 1-3 are entered zero times, source 4 once, matching never.
        const values = { rows: [{ note: 'a' }] }
        const scope = resolvePopupScope({ id: 'edit', form: formWith(values), props: {} })

        expect(scope).toEqual({ relativeIndex: null, relativeData: values, relativePath: null })
    })
})

describe('without a form to ask', () => {
    it('resolves nothing at all', () => {
        expect(resolvePopupScope({ id: 'edit', props: {} }))
            .toEqual({ relativeIndex: null, relativeData: null, relativePath: null })
    })

    it('ignores something form-shaped that cannot report its state', () => {
        expect(resolvePopupScope({ id: 'edit', form: {}, props: { index: 1 } }))
            .toEqual({ relativeIndex: null, relativeData: null, relativePath: null })
    })
})
