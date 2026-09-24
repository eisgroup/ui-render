/**
 * `showIf` — the attribute that decides whether a node renders at all.
 * =============================================================================================
 *
 * Until §9.3 step 2 lifted it out of `RenderComponent`, this logic could only be reached by
 * rendering a tree, and the only thing exercising it was one example in the corpus plus whatever
 * engine tests happened to pass a `showIf`. Its three shapes, the array-row prefixing and the two
 * separate `relativeData: false` escapes were described in comments and asserted nowhere.
 */
import { shouldRender } from '../showIf'

const ask = overrides => shouldRender({ data: {}, _data: undefined, ...overrides })

describe('showIf decides whether a node renders', () => {
    it('renders when there is no showIf at all', () => {
        expect(ask({ showIf: undefined })).toBe(true)
        expect(ask({ showIf: null })).toBe(true)
    })

    describe('a string names a path', () => {
        it('reads the local data the node was rendered against', () => {
            expect(ask({ showIf: 'visible', _data: { visible: true }, data: { visible: false } })).toBe(true)
        })

        it('reads the document data when the node opts out of local data', () => {
            expect(ask({
                showIf: 'visible',
                relativeData: false,
                _data: { visible: true },
                data: { visible: false },
            })).toBe(false)
        })

        it('hides the node when the value is falsy', () => {
            expect(ask({ showIf: 'visible', _data: { visible: 0 } })).toBe(false)
            expect(ask({ showIf: 'missing', _data: {} })).toBe(false)
        })
    })

    describe('an object names a path and optionally a value to match', () => {
        it('renders on a truthy value', () => {
            expect(ask({ showIf: { name: 'flag' }, data: { flag: 'yes' } })).toBe(true)
            expect(ask({ showIf: { name: 'flag' }, data: { flag: '' } })).toBe(false)
        })

        it('compares against `equal` when one is given, instead of testing truthiness', () => {
            expect(ask({ showIf: { name: 'status', equal: 'draft' }, data: { status: 'draft' } })).toBe(true)
            expect(ask({ showIf: { name: 'status', equal: 'draft' }, data: { status: 'final' } })).toBe(false)
        })

        it('matches a falsy value that `equal` asks for — where truthiness would hide the node', () => {
            expect(ask({ showIf: { name: 'count', equal: 0 }, data: { count: 0 } })).toBe(true)
        })

        it('renders on a truthy local value when the node carries no name', () => {
            expect(ask({ showIf: {}, _data: 'anything' })).toBe(true)
            expect(ask({ showIf: {}, _data: undefined })).toBe(false)
        })
    })

    describe('inside an array row', () => {
        const row = { showIf: { name: 'done' }, relativePath: 'rows', relativeIndex: 1 }

        it('prefixes the path with the row it is rendered in', () => {
            expect(ask({ ...row, data: { rows: [{ done: false }, { done: true }] } })).toBe(true)
            expect(ask({ ...row, data: { rows: [{ done: true }, { done: false }] } })).toBe(false)
        })

        it('reads a global path instead when the showIf opts out', () => {
            expect(ask({
                showIf: { name: 'allDone', relativeData: false },
                relativePath: 'rows',
                relativeIndex: 1,
                data: { allDone: true, rows: [{}, {}] },
            })).toBe(true)
        })

        it('reads a global path instead when the NODE opts out', () => {
            expect(ask({
                ...row,
                showIf: { name: 'allDone' },
                relativeData: false,
                data: { allDone: true, rows: [{}, {}] },
            })).toBe(true)
        })
    })

    describe('the live form', () => {
        const instanceWith = values => ({ getRawFormsData: () => values })

        it('sees a value the user has typed, over the one the document was opened with', () => {
            expect(ask({
                showIf: { name: 'flag' },
                data: { flag: true },
                instance: instanceWith({ flag: false }),
            })).toBe(false)
        })

        it('keeps a document value the form does not carry at all', () => {
            // The merge is why a node gated on a data-only flag does not vanish the moment a form
            // reports an empty or partial state.
            expect(ask({
                showIf: { name: 'layoutFlag' },
                data: { layoutFlag: true },
                instance: instanceWith({}),
            })).toBe(true)
        })

        it('falls back to the document data when the instance offers no form data', () => {
            expect(ask({ showIf: { name: 'flag' }, data: { flag: true }, instance: {} })).toBe(true)
            expect(ask({
                showIf: { name: 'flag' },
                data: { flag: true },
                instance: instanceWith(undefined),
            })).toBe(true)
        })
    })

    it('interpolates a {state.x} template in the name before reading it', () => {
        const instance = { state: { chosen: 1 }, getRawFormsData: () => undefined }

        expect(shouldRender({
            showIf: { name: 'rows.{state.chosen}.done' },
            data: { rows: [{ done: false }, { done: true }] },
            instance,
        })).toBe(true)
    })

    it('renders for a showIf that is neither a string nor an object', () => {
        // Preserved rather than tightened: the original fell through every branch and rendered.
        expect(ask({ showIf: 42 })).toBe(true)
        expect(ask({ showIf: true })).toBe(true)
    })
})
