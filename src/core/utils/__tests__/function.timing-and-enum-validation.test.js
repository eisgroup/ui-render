import { debounce, throttle } from '../function'

describe('function timing contracts', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2026-07-31T12:00:00Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('starts a new leading debounce window immediately after the previous one expires', () => {
        const callback = jest.fn()
        const debounced = debounce(callback, 100, { leading: true })

        debounced('first')
        expect(callback).toHaveBeenLastCalledWith('first')

        jest.advanceTimersByTime(100)
        debounced('second')

        expect(callback).toHaveBeenCalledTimes(2)
        expect(callback).toHaveBeenLastCalledWith('second')
    })

    it('runs one trailing debounce with the latest context and arguments after a leading burst', () => {
        const calls = []
        const context = {
            id: 'context',
            run: debounce(function (value) {
                calls.push([this.id, value])
            }, 100, { leading: true }),
        }

        context.run('first')
        context.run('second')
        context.run('latest')
        expect(calls).toEqual([['context', 'first']])

        jest.advanceTimersByTime(100)
        expect(calls).toEqual([
            ['context', 'first'],
            ['context', 'latest'],
        ])
    })

    it('does not duplicate a single leading debounce call on the trailing edge', () => {
        const callback = jest.fn()
        const debounced = debounce(callback, 50, { leading: true })

        debounced('once')
        jest.advanceTimersByTime(50)

        expect(callback).toHaveBeenCalledTimes(1)
    })

    it('forwards the latest arguments and context for a trailing-only throttle', () => {
        const calls = []
        const context = {
            id: 'context',
            run: throttle(function (value) {
                calls.push([this.id, value])
            }, 100, { leading: false }),
        }

        context.run('first')
        context.run('latest')
        expect(calls).toEqual([])

        jest.advanceTimersByTime(100)
        expect(calls).toEqual([['context', 'latest']])
    })

    it('suppresses trailing throttle work when trailing is disabled', () => {
        const callback = jest.fn()
        const throttled = throttle(callback, 100, { trailing: false })

        throttled('first')
        throttled('ignored')
        expect(callback).toHaveBeenCalledTimes(1)

        jest.advanceTimersByTime(100)
        throttled('next-window')
        expect(callback).toHaveBeenCalledTimes(2)
        expect(callback).toHaveBeenLastCalledWith('next-window')
    })

    it('cancels a pending trailing throttle when a later call starts a new window', () => {
        const callback = jest.fn()
        const throttled = throttle(callback, 100)

        throttled('leading')
        throttled('pending')
        jest.setSystemTime(new Date('2026-07-31T12:00:00.200Z'))
        throttled('new-window')

        expect(callback).toHaveBeenCalledTimes(2)
        expect(callback).toHaveBeenLastCalledWith('new-window')
        jest.runOnlyPendingTimers()
        expect(callback).toHaveBeenCalledTimes(2)
    })
})

describe('enumCheck development contract', () => {
    const originalNodeEnv = process.env.NODE_ENV

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv
        jest.resetModules()
    })

    it('names the caller in development errors and accepts configured values', () => {
        process.env.NODE_ENV = 'development'
        jest.resetModules()
        const { enumCheck } = require('../function')
        function configureMode () {}

        expect(() => enumCheck(['compact', 'full'], 'compact', configureMode)).not.toThrow()
        expect(() => enumCheck(['compact', 'full'], 'invalid', configureMode)).toThrow(
            "configureMode expected @value to be one of compact,full, but got 'invalid'"
        )
        expect(() => enumCheck(['compact'], 'invalid')).toThrow(
            "function expected @value to be one of compact, but got 'invalid'"
        )
    })
})
