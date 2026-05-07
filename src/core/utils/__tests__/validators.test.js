import { isEmail, isLengthMax, isURLWithProtocol } from '../validators'

describe('validators', () => {
    describe('isEmail', () => {
        it('accepts typical addresses', () => {
            expect(isEmail('a@b.co')).toBe(true)
            expect(isEmail('user.name+tag@example.com')).toBe(true)
        })

        it('rejects invalid values', () => {
            expect(isEmail('')).toBe(false)
            expect(isEmail('not-an-email')).toBe(false)
            expect(isEmail('@nodomain')).toBe(false)
            expect(isEmail('spaces in@x.com')).toBe(false)
            expect(isEmail(null)).toBe(false)
            expect(isEmail(undefined)).toBe(false)
        })
    })

    describe('isLengthMax', () => {
        it('respects max length', () => {
            expect(isLengthMax('abc', 3)).toBe(true)
            expect(isLengthMax('abc', 4)).toBe(true)
            expect(isLengthMax('abcd', 3)).toBe(false)
        })

        it('treats null/undefined as empty string', () => {
            expect(isLengthMax(null, 0)).toBe(true)
            expect(isLengthMax(null, 1)).toBe(true)
            expect(isLengthMax(undefined, 0)).toBe(true)
        })

        it('coerces numbers to string length', () => {
            expect(isLengthMax(12345, 5)).toBe(true)
            expect(isLengthMax(123456, 5)).toBe(false)
        })
    })

    describe('isURLWithProtocol', () => {
        it('accepts http(s) with host and path', () => {
            expect(isURLWithProtocol('http://example.com')).toBe(true)
            expect(isURLWithProtocol('https://sub.example.co.uk/path')).toBe(true)
            expect(isURLWithProtocol('https://example.com/foo?bar=1&baz=2')).toBe(true)
            expect(isURLWithProtocol('http://localhost:3000/')).toBe(true)
        })

        it('rejects missing or wrong protocol', () => {
            expect(isURLWithProtocol('')).toBe(false)
            expect(isURLWithProtocol('ftp://example.com')).toBe(false)
            expect(isURLWithProtocol('example.com')).toBe(false)
            expect(isURLWithProtocol('//example.com')).toBe(false)
            expect(isURLWithProtocol('http://')).toBe(false)
            expect(isURLWithProtocol('http:// ')).toBe(false)
        })

        it('rejects non-strings', () => {
            expect(isURLWithProtocol(null)).toBe(false)
            expect(isURLWithProtocol(undefined)).toBe(false)
        })
    })
})
