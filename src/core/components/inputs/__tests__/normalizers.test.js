import {
  integer,
  double5,
  uppercase,
  phone,
} from '../normalizers'

describe('integer', () => {
    it('parses numeric strings as integers', () => {
        expect(integer('42')).toBe(42)
        expect(integer('  -7  ')).toBe(-7)
    })
    it('returns empty/null/undefined as-is', () => {
        expect(integer('')).toBe('')
        expect(integer(null)).toBeNull()
        expect(integer(undefined)).toBeUndefined()
    })
    it('returns the original value if parseInt fails', () => {
        expect(integer('abc')).toBe('abc')
    })
    it('truncates decimals', () => {
        expect(integer('3.99')).toBe(3)
    })
})

describe('double5', () => {
    it('rounds to 5 decimals', () => {
        expect(double5(1.234567)).toBe(1.23457)
    })
    it('returns falsy values as-is', () => {
        expect(double5(0)).toBe(0)
        expect(double5(null)).toBeNull()
        expect(double5('')).toBe('')
    })
})

describe('uppercase', () => {
    it('uppercases strings', () => {
        expect(uppercase('abc')).toBe('ABC')
    })
    it('returns anything else as it is, such as an empty field\'s undefined', () => {
        expect(uppercase(undefined)).toBeUndefined()
        expect(uppercase(null)).toBeNull()
        expect(uppercase('')).toBe('')
        expect(uppercase(7)).toBe(7)
    })
})

describe('phone', () => {
    it('returns falsy input as-is', () => {
        expect(phone('')).toBe('')
        expect(phone(null)).toBeNull()
    })
    it('keeps allowed characters', () => {
        expect(phone('+1 (212) 555-1234')).toBe('+1 (212) 555-1234')
    })
    it('strips disallowed characters', () => {
        expect(phone('+1abc(212)def555-1234')).toBe('+1(212)555-1234')
    })
    it('collapses multiple spaces', () => {
        expect(phone('+1   555   1234')).toBe('+1 555 1234')
    })
})
