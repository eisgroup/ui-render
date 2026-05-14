import {
    integer,
    double5,
    emptyStringToNull,
    uppercase,
    number,
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

describe('emptyStringToNull', () => {
    it('converts empty string to null', () => {
        expect(emptyStringToNull('')).toBeNull()
    })
    it('leaves other values unchanged', () => {
        expect(emptyStringToNull('x')).toBe('x')
        expect(emptyStringToNull(0)).toBe(0)
        expect(emptyStringToNull(null)).toBeNull()
    })
})

describe('uppercase', () => {
    it('uppercases strings', () => {
        expect(uppercase('abc')).toBe('ABC')
    })
})

describe('number normalizer factory', () => {
    it('clamps to max', () => {
        const fn = number({ max: 10 })
        expect(fn(15)).toBe(10)
    })
    it('clamps to min', () => {
        const fn = number({ min: 0 })
        expect(fn(-5)).toBe(0)
    })
    it('rounds to decimals when value is truthy', () => {
        const fn = number({ decimals: 2 })
        expect(fn(1.2345)).toBe(1.23)
    })
    it('leaves zero unchanged when decimals is set (falsy guard)', () => {
        const fn = number({ decimals: 2 })
        expect(fn(0)).toBe(0)
    })
    it('returns the value as-is when within range and no decimals', () => {
        const fn = number({ min: 0, max: 10 })
        expect(fn(5)).toBe(5)
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
