import { isFunction, isAsync, debounce, throttle } from '../function'

describe('isFunction', () => {
    it('returns true for plain functions', () => {
        expect(isFunction(() => {})).toBe(true)
        expect(isFunction(function () {})).toBe(true)
    })
    it('returns true for async functions', () => {
        expect(isFunction(async () => {})).toBe(true)
    })
    it('returns true for generator functions', () => {
        expect(isFunction(function * () {})).toBe(true)
    })
    it('returns false for non-functions', () => {
        expect(isFunction(null)).toBe(false)
        expect(isFunction(undefined)).toBe(false)
        expect(isFunction(42)).toBe(false)
        expect(isFunction('fn')).toBe(false)
        expect(isFunction({})).toBe(false)
    })
})

describe('isAsync', () => {
    it('returns true for async functions', () => {
        expect(isAsync(async () => {})).toBe(true)
    })
    it('returns false for sync functions', () => {
        expect(isAsync(() => {})).toBe(false)
    })
})

describe('debounce', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })
    afterEach(() => {
        jest.useRealTimers()
    })

    it('only calls the function once after the wait window', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 100)
        debounced()
        debounced()
        debounced()
        expect(fn).not.toHaveBeenCalled()
        jest.advanceTimersByTime(100)
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('passes arguments through to the wrapped function', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 50)
        debounced('a', 'b')
        jest.advanceTimersByTime(50)
        expect(fn).toHaveBeenCalledWith('a', 'b')
    })

    it('calls immediately when leading is true', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 100, { leading: true })
        debounced()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('does not call leading-edge twice within wait window', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 100, { leading: true })
        debounced()
        debounced()
        debounced()
        // leading fires once; subsequent calls still pending until timer expires
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('uses the default wait when none provided', () => {
        const fn = jest.fn()
        const debounced = debounce(fn)
        debounced('arg')
        jest.runAllTimers()
        expect(fn).toHaveBeenCalledWith('arg')
    })
})

describe('throttle', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })
    afterEach(() => {
        jest.useRealTimers()
    })

    it('throttles repeated calls within the wait period', () => {
        const fn = jest.fn()
        const throttled = throttle(fn, 100)
        throttled()
        throttled()
        throttled()
        // leading edge: one call should fire immediately
        expect(fn).toHaveBeenCalledTimes(1)
        jest.advanceTimersByTime(100)
        // trailing edge: should call at most one more time
        expect(fn.mock.calls.length).toBeLessThanOrEqual(2)
    })
})
