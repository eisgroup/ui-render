import { cursorSet, cursorUnset, inlineSvg, offsetFrom, syncState } from '../interactions'

describe('cursorSet / cursorUnset', () => {
    afterEach(() => {
        document.body.style.cursor = ''
    })

    it('sets the body cursor', () => {
        cursorSet('pointer')
        expect(document.body.style.cursor).toBe('pointer')
    })

    it('unsets the body cursor', () => {
        document.body.style.cursor = 'pointer'
        cursorUnset()
        expect(document.body.style.cursor).toBe('')
    })
})

describe('inlineSvg', () => {
    it('produces an inline url() with default x/y', () => {
        expect(inlineSvg('<svg/>')).toBe("url('data:image/svg+xml;utf8,<svg/>') 0 0, auto")
    })
    it('URL-encodes # to %23', () => {
        expect(inlineSvg('<svg color="#fff"/>')).toContain('%23fff')
    })
    it('honors custom x and y hot-spot coordinates', () => {
        expect(inlineSvg('<svg/>', 5, 7)).toContain(') 5 7,')
    })
})

describe('offsetFrom', () => {
    it('computes coordinates relative to the rectangle', () => {
        const event = { clientX: 100, clientY: 50 }
        const rectangle = { left: 20, top: 10 }
        expect(offsetFrom(event, rectangle)).toEqual({ x: 80, y: 40 })
    })
})

describe('syncState', () => {
    it('calls setState with the changed keys and returns true', () => {
        const setState = jest.fn()
        const instance = { setState }
        const result = syncState({ id: 1 }, { id: 2 }, instance)
        expect(setState).toHaveBeenCalledWith({ id: 2 }, undefined)
        expect(result).toBe(true)
    })

    it('returns undefined when nothing changed', () => {
        const setState = jest.fn()
        const instance = { setState }
        expect(syncState({ id: 1 }, { id: 1 }, instance)).toBeUndefined()
        expect(setState).not.toHaveBeenCalled()
    })

    it('invokes preCallback before setState when provided', () => {
        const calls = []
        const setState = jest.fn(() => calls.push('setState'))
        const preCallback = jest.fn(() => calls.push('preCallback'))
        const instance = { setState }
        syncState({ x: 1 }, { x: 2 }, instance, undefined, preCallback)
        expect(calls).toEqual(['preCallback', 'setState'])
        expect(preCallback).toHaveBeenCalledWith({ x: 2 })
    })

    it('ignores keys where the next value is null', () => {
        const setState = jest.fn()
        syncState({ x: 1 }, { x: null }, { setState })
        expect(setState).not.toHaveBeenCalled()
    })
})
