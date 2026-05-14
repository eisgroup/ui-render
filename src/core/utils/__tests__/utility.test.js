import {
    Id,
    isId,
    isTruthy,
    timestampFromId,
    distanceBetween,
    isGoodPassword,
    namespace,
    passStrength,
} from '../utility'

describe('Id', () => {
    it('produces an Id of at least minLength', () => {
        const id = Id()
        expect(id.length).toBeGreaterThanOrEqual(Id.minLength)
    })

    it('lower-cases the suffix by default (case-insensitive)', () => {
        const id = Id()
        expect(id).toMatch(/^[0-9a-z]+$/)
    })

    it('produces case-sensitive ids when requested', () => {
        const id = Id({ caseSensitive: true })
        expect(id.length).toBeGreaterThanOrEqual(7) // padCount=7 for caseSensitive
    })

    it('honors a custom suffix', () => {
        const id = Id({ suffix: 'abc' })
        expect(id.endsWith('abc')).toBe(true)
    })

    it('produces increasing ids for increasing timestamps (chronological sort)', () => {
        const a = Id({ timestamp: 1000, suffix: 'aaa' })
        const b = Id({ timestamp: 2000, suffix: 'aaa' })
        expect(a < b).toBe(true)
    })

    it('avoids duplicate suffixes within the same millisecond', () => {
        const ts = Date.now()
        const a = Id({ timestamp: ts })
        const b = Id({ timestamp: ts })
        expect(a).not.toBe(b)
    })
})

describe('isId', () => {
    it('returns true for a freshly generated Id', () => {
        expect(isId(Id())).toBe(true)
    })
    it('returns false for too-short strings', () => {
        expect(isId('abc')).toBe(false)
    })
    it('returns false for non-strings', () => {
        expect(isId(null)).toBe(false)
        expect(isId(42)).toBe(false)
    })
    it('returns false for strings with characters outside the alphabet', () => {
        expect(isId('1234567890!')).toBe(false)
    })
})

describe('isTruthy', () => {
    it('treats falsy primitives as falsy', () => {
        expect(isTruthy(false)).toBe(false)
        expect(isTruthy(undefined)).toBe(false)
        expect(isTruthy(null)).toBe(false)
        expect(isTruthy(NaN)).toBe(false)
        expect(isTruthy(0)).toBe(false)
        expect(isTruthy('')).toBe(false)
    })
    it('treats empty arrays and objects as falsy', () => {
        expect(isTruthy([])).toBe(false)
        expect(isTruthy({})).toBe(false)
    })
    it('treats non-empty values as truthy', () => {
        expect(isTruthy(1)).toBe(true)
        expect(isTruthy('x')).toBe(true)
        expect(isTruthy([0])).toBe(true)
        expect(isTruthy({ a: 1 })).toBe(true)
    })
})

describe('timestampFromId', () => {
    it('round-trips Id() back to its timestamp', () => {
        const ts = 1700000000000
        const id = Id({ timestamp: ts, caseSensitive: true })
        expect(timestampFromId(id)).toBe(ts)
    })
    it('throws for an invalid Id', () => {
        expect(() => timestampFromId('!!!abcdefg')).toThrow()
    })
})

describe('distanceBetween', () => {
    it('returns 0 for identical points', () => {
        const p = { lat: 50, lng: 30 }
        expect(distanceBetween(p, p)).toBe(0)
    })
    it('computes a positive distance for different points', () => {
        const a = { lat: 50, lng: 30 }
        const b = { lat: 51, lng: 30 }
        const mm = distanceBetween(a, b)
        expect(mm).toBeGreaterThan(0)
    })
    it('converts to km / m when requested', () => {
        const a = { lat: 50, lng: 30 }
        const b = { lat: 51, lng: 30 }
        const m = distanceBetween(a, b, 'm')
        const km = distanceBetween(a, b, 'km')
        expect(km).toBeCloseTo(m / 1000, 3)
    })
})

describe('isGoodPassword / passStrength', () => {
    it('uses Active.passwordCheck and returns boolean', () => {
        const original = window.zxcvbn
        window.zxcvbn = () => ({ score: 4 })
        try {
            expect(isGoodPassword('whatever')).toBe(true)
            expect(passStrength('whatever')).toBe(4)
        } finally {
            window.zxcvbn = original
        }
    })
    it('returns false when score is below threshold', () => {
        const original = window.zxcvbn
        window.zxcvbn = () => ({ score: 1 })
        try {
            expect(isGoodPassword('weak')).toBe(false)
        } finally {
            window.zxcvbn = original
        }
    })
})

describe('namespace', () => {
    it('prefixes the constant with a tilde and service name', () => {
        expect(namespace('LOGIN', 'WEB')).toBe('~WEB LOGIN')
    })
})
