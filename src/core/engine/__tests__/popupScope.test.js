/**
 * WHICH ROW A POPUP BELONGS TO.
 * =============================================================================================
 *
 * `POPUP_OPEN` resolves a row index, row data and array path before it interpolates a popup id, and
 * until §9.3 step 2 that decision was sixty lines inside a three-hundred-line handler, reachable
 * only by clicking a button in a rendered table.
 *
 * Every source is written down here for what it does, including the two that a measurement over the
 * whole suite found never fire. They were kept: `Data.js` sets the props they read, so they are
 * reachable in a nested document and merely uncovered — see the note on the last case.
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

describe('the sources, in the order they are tried', () => {
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

    it('a relativePath prop is not a source — nothing sets that prop on an engine instance', () => {
        // There used to be a source keyed on it, between 2 and the last. `Data.js` passes `index` and
        // `relativeIndex` to a nested UIRender and puts the path in `meta`; no `relativePath` prop
        // ever arrives, so the source could not fire and cases fell past it to the last one.
        const values = { orders: {} }
        const scope = resolvePopupScope({
            id: 'edit',
            form: formWith(values),
            props: { relativePath: 'orders.lines[4]' },
        })

        expect(scope).toEqual({ relativeIndex: null, relativeData: values, relativePath: null })
    })

    it('last — the first form field name that carries a bracketed index', () => {
        const values = { plain: 1, 'rows[2]': {}, 'later[9]': {} }
        const scope = resolvePopupScope({ id: 'edit', form: formWith(values), props: {} })

        expect(scope).toEqual({ relativeIndex: 2, relativeData: values, relativePath: 'rows' })
    })

    it('last — with nothing bracketed to find, only the form values come back', () => {
        // THE CASE THAT ACTUALLY HAPPENS. final-form nests a bracketed name into a real array, so a
        // top-level values key cannot contain `[` — this source fires and never matches. Measured
        // over the whole suite: sources 1 and 2 are entered zero times, this one once, matching never.
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
