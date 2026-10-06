import {
  isNumeric,
  formatNumber,
  shortNumber,
  formatSI,
  toOrdinal,
  round,
  toPercent,
} from '../number'

describe('isNumeric', () => {
    it('returns true for numbers and numeric strings', () => {
        expect(isNumeric(3)).toBe(true)
        expect(isNumeric('3')).toBe(true)
        expect(isNumeric('3.14')).toBe(true)
        expect(isNumeric('-1e5')).toBe(true)
    })
    it('returns false for non-numeric strings', () => {
        expect(isNumeric('a')).toBe(false)
        expect(isNumeric('')).toBe(false)
        expect(isNumeric(NaN)).toBe(false)
    })
})

describe('formatNumber', () => {
    it('formats large numbers with delimiters', () => {
        expect(formatNumber(1234567)).toBe('1,234,567')
    })
    it('formats decimals', () => {
        expect(formatNumber(3.14159, { decimals: 2 })).toBe('3.14')
    })
    it('uses custom decimal delimiter', () => {
        expect(formatNumber(1234.5, { decimals: 1, decimalDelimiter: ',' })).toBe('1,234,5')
    })
    it('returns non-numeric inputs as-is', () => {
        expect(formatNumber('abc')).toBe('abc')
    })
    it('handles negative numbers', () => {
        expect(formatNumber(-1234567)).toBe('-1,234,567')
    })
    it('strips negative sign on zero result', () => {
        expect(formatNumber(-0.0001, { decimals: 2 })).toBe('0.00')
    })
    it('produces ordinal form', () => {
        expect(formatNumber(1, { ordinal: true })).toBe('1st')
    })
})

describe('shortNumber / formatSI', () => {
    it('returns 0 for zero', () => {
        expect(shortNumber(0)).toBe('0')
        expect(formatSI(0)).toBe('0')
    })
    it('shortens numbers with SI suffix', () => {
        expect(shortNumber(1500)).toBe('1.5k')
        expect(shortNumber(1500000)).toBe('1.5M')
    })
    it('handles negatives', () => {
        expect(shortNumber(-1500)).toBe('-1.5k')
    })
    it('no suffix for numbers below divider', () => {
        expect(shortNumber(123)).toBe('123')
    })
    it('formatSI honors custom delimiter', () => {
        expect(formatSI(1500, 3, 1000, ' ')).toBe('1.5 k')
    })

    it('formatSI handles very small numbers (negative exponent)', () => {
        // 0.0015 → 1.5m (milli)
        expect(formatSI(0.0015)).toBe('1.5m')
    })

    it('formatSI rounds without precision when precision=0', () => {
        // precision=0 falls into Math.round branch
        expect(formatSI(1500, 0)).toBe('2k')
    })

    it('formatSI handles negative input', () => {
        expect(formatSI(-1500)).toBe('-1.5k')
    })

    it('shortNumber rounds without decimals when digits exceed precision', () => {
        // exactly 1 < divider, falls into no-suffix branch
        expect(shortNumber(0.5)).toBe('0.5')
    })
})

describe('toOrdinal', () => {
    it('handles common ordinals', () => {
        expect(toOrdinal(1)).toBe('1st')
        expect(toOrdinal(2)).toBe('2nd')
        expect(toOrdinal(3)).toBe('3rd')
        expect(toOrdinal(4)).toBe('4th')
        expect(toOrdinal(11)).toBe('11th')
        expect(toOrdinal(12)).toBe('12th')
        expect(toOrdinal(13)).toBe('13th')
        expect(toOrdinal(21)).toBe('21st')
        expect(toOrdinal(102)).toBe('102nd')
    })
})

describe('round', () => {
    it('rounds to given precision', () => {
        expect(round(123.4567, 3)).toBe(123.457)
        expect(round(123.4567)).toBe(123)
    })
})

describe('toPercent', () => {
    it('converts fraction to percent string', () => {
        expect(toPercent(0.5)).toBe('50%')
        expect(toPercent(0.1234, 2)).toBe('12.34%')
    })
    it('returns empty string for non-numeric input', () => {
        expect(toPercent('x')).toBe('')
    })
})
