describe('Id collision and history contracts', () => {
    afterEach(() => {
        jest.dontMock('../string.js')
        jest.resetModules()
    })

    function loadUtilityWithRandomValues (...values) {
        jest.resetModules()
        const randomString = jest.fn()
        values.forEach(value => randomString.mockReturnValueOnce(value))
        jest.doMock('../string.js', () => ({
            ...jest.requireActual('../string.js'),
            randomString,
        }))

        let utility
        jest.isolateModules(() => {
            utility = require('../utility.js')
        })

        return { ...utility, randomString }
    }

    it('retries a supplied suffix collision after case normalization', () => {
        const { Id, randomString } = loadUtilityWithRandomValues('XyZ')
        const timestamp = 1700000000000
        Id.history = { [timestamp]: ['abc'] }

        const id = Id({ timestamp, suffix: 'ABC' })

        expect(randomString).toHaveBeenCalledTimes(1)
        expect(id.endsWith('xyz')).toBe(true)
        expect(Id.history[timestamp]).toEqual(['abc', 'xyz'])
    })

    it('keeps retrying until a genuinely unused normalized suffix is found', () => {
        const { Id, randomString } = loadUtilityWithRandomValues('AAA', 'BbB')
        const timestamp = 1700000000001
        Id.history = { [timestamp]: ['aaa'] }

        const id = Id({ timestamp, suffix: 'AAA' })

        expect(randomString).toHaveBeenCalledTimes(2)
        expect(id.endsWith('bbb')).toBe(true)
        expect(Id.history[timestamp]).toEqual(['aaa', 'bbb'])
    })

    it('treats differently cased suffixes as distinct in case-sensitive mode', () => {
        const { Id, randomString } = loadUtilityWithRandomValues()
        const timestamp = 1700000000002
        Id.history = { [timestamp]: ['abc'] }

        const id = Id({ timestamp, caseSensitive: true, suffix: 'ABC' })

        expect(randomString).not.toHaveBeenCalled()
        expect(id.endsWith('ABC')).toBe(true)
        expect(Id.history[timestamp]).toEqual(['abc', 'ABC'])
    })

    it('preserves replacement casing while resolving a case-sensitive collision', () => {
        const { Id, randomString } = loadUtilityWithRandomValues('XyZ')
        const timestamp = 1700000000003
        Id.history = { [timestamp]: ['ABC'] }

        const id = Id({ timestamp, caseSensitive: true, suffix: 'ABC' })

        expect(randomString).toHaveBeenCalledTimes(1)
        expect(id.endsWith('XyZ')).toBe(true)
        expect(Id.history[timestamp]).toEqual(['ABC', 'XyZ'])
    })

    it('cleans older history entries without deleting current or future timestamps', () => {
        const { Id } = loadUtilityWithRandomValues()
        Id.history = {
            99: ['old'],
            100: ['current'],
            101: ['future'],
        }

        Id({ timestamp: 100, suffix: 'new' })

        expect(Id.history).toEqual({
            100: ['current', 'new'],
            101: ['future'],
        })
    })
})
