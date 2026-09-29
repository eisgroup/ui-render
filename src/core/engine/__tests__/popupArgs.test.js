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
import { parsePopupAlertArgs, parsePopupArgs } from '../popupArgs'

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

/**
 * THE `popup` ACTION'S HALF: the title and the content it shows. Every real call shape, including
 * the two the corpus writes: a `Button` with nothing configured, and a `fetch` chain ending in
 * `onDone: {name: 'popup', args: ['…']}`, as `config.md` documents it.
 */
describe('what a `popup` action shows', () => {
    const click = { nativeEvent: {}, target: {}, preventDefault: () => {}, stopPropagation: () => {} }

    it('nothing, for a Button with nothing configured: the click event is not something to show', () => {
        expect(parsePopupAlertArgs([click])).toEqual({ title: undefined, content: undefined })
    })

    it('a configured text as the title', () => {
        expect(parsePopupAlertArgs([click, 'Saved'])).toEqual({ title: 'Saved', content: undefined })
    })

    it('a second configured text as the content, in the order the meta writes them', () => {
        expect(parsePopupAlertArgs([click, 'Saved', 'All changes are stored']))
            .toEqual({ title: 'Saved', content: 'All changes are stored' })
    })

    it('a chain step\'s result as the content, under the text the chain configures', () => {
        expect(parsePopupAlertArgs([{ city: 'Oslo' }, 'Lookup result']))
            .toEqual({ title: 'Lookup result', content: { city: 'Oslo' } })
    })

    it('only the title, for a chain step that resolved with nothing', () => {
        expect(parsePopupAlertArgs([undefined, 'Lookup result'])).toEqual({ title: 'Lookup result', content: undefined })
    })

    it('a caller\'s number as the content', () => {
        expect(parsePopupAlertArgs([42, 'Count'])).toEqual({ title: 'Count', content: 42 })
    })

    it('never a value that is not text as the title, even with no text to take its place', () => {
        expect(parsePopupAlertArgs([{ city: 'Oslo' }])).toEqual({ title: undefined, content: { city: 'Oslo' } })
    })

    it('drops a component class too, in the order a click delivers it', () => {
        class Caller {
            render () { return null }
        }
        Caller.prototype.isReactComponent = {}

        expect(parsePopupAlertArgs([Caller, click, 'Saved'])).toEqual({ title: 'Saved', content: undefined })
    })
})
