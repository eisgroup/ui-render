/**
 * WHAT A `popupOpen` ACTION WAS ASKED TO OPEN.
 * =============================================================================================
 *
 * The first thirty-seven lines of `POPUP_OPEN`, and until §9.3 step 2 they could only be reached by
 * clicking a rendered button. `rules.popup-actions.test.js` covers three of these shapes that way
 * and is the reason the extraction could be trusted; what it cannot do is say which of them the
 * parsing is responsible for, or what happens to the ones nobody wired a button for.
 *
 * The caller's own arguments come FIRST because `getFunctionFromString` appends a meta's configured
 * arguments to whatever the caller passes — the same mechanism that makes the state path "the last
 * string argument" in `setStates`.
 */
import { parsePopupArgs } from '../popupArgs'

/** A React SyntheticEvent is recognised by any one of these, so each is worth its own case. */
const eventLike = [
    ['nativeEvent', { nativeEvent: {} }],
    ['target', { target: {} }],
    ['preventDefault', { preventDefault: () => {} }],
    ['stopPropagation', { stopPropagation: () => {} }],
]

describe('the shapes a meta may write', () => {
    it('a bare id', () => {
        expect(parsePopupArgs(['edit'])).toEqual({ id: 'edit', options: {} })
    })

    it('an id and options', () => {
        expect(parsePopupArgs(['edit', { relativeIndex: 2 }]))
            .toEqual({ id: 'edit', options: { relativeIndex: 2 } })
    })

    it('a single options object carrying the id', () => {
        expect(parsePopupArgs([{ id: 'edit', relativeIndex: 2 }]))
            .toEqual({ id: 'edit', options: { id: 'edit', relativeIndex: 2 } })
    })

    it('an options object followed by the id, which wins over the one inside', () => {
        expect(parsePopupArgs([{ id: 'inner' }, 'outer']))
            .toEqual({ id: 'outer', options: { id: 'inner' } })
    })

    it('a number, which a meta may legitimately write as `popupOpen,7`', () => {
        expect(parsePopupArgs([7])).toEqual({ id: '7', options: {} })
    })
})

describe('what the caller prepends is dropped', () => {
    it.each(eventLike)('an event recognised by its %s', (_name, event) => {
        expect(parsePopupArgs([event, 'edit'])).toEqual({ id: 'edit', options: {} })
    })

    it('a React component class, which is a function and would otherwise pass as a primitive', () => {
        class Caller {
            render () { return null }
        }
        Caller.prototype.isReactComponent = {}

        expect(parsePopupArgs([Caller, 'edit'])).toEqual({ id: 'edit', options: {} })
    })

    it('several at once, in the order a click actually delivers them', () => {
        class Caller {
            render () { return null }
        }
        Caller.prototype.isReactComponent = {}

        expect(parsePopupArgs([Caller, { target: {} }, 'edit', { relativeIndex: 1 }]))
            .toEqual({ id: 'edit', options: { relativeIndex: 1 } })
    })

    it('but a plain object is NOT an event, and is read as options', () => {
        expect(parsePopupArgs([{ id: 'edit' }])).toEqual({ id: 'edit', options: { id: 'edit' } })
    })
})

describe('a call it cannot use', () => {
    let consoleError

    beforeEach(() => {
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleError.mockRestore()
    })

    it('says so when nothing survives the filtering', () => {
        expect(parsePopupArgs([{ target: {} }])).toBeNull()
        expect(consoleError).toHaveBeenCalledWith('Popup Open: no arguments provided after filtering')
    })

    it('says so when the options carry no id', () => {
        expect(parsePopupArgs([{ relativeIndex: 2 }])).toBeNull()
        expect(consoleError).toHaveBeenCalledWith(
            'Popup Open: id must be a non-empty string, got:', 'undefined', undefined
        )
    })

    it('says so for an empty id', () => {
        expect(parsePopupArgs([''])).toBeNull()
        expect(consoleError).toHaveBeenCalledWith(
            'Popup Open: id must be a non-empty string, got:', 'string', ''
        )
    })
})
