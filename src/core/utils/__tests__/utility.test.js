import {
  isTruthy,
  isGoodPassword,
  passStrength,
} from '../utility'

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

