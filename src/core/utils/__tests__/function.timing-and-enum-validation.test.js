import { debounce } from '../function'

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
