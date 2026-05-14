import {
    isNumber,
    isNumeric,
    startEndFromNumberRanges,
    formatNumber,
    shortNumber,
    formatSI,
    toOrdinal,
    rad,
    round,
    roundUp,
    roundDown,
    roundTo,
    roundDownTo,
    roundUpTo,
    decimalPlaces,
    greatestCommonDivisor,
    randomNumberInRange,
    toPercentage,
    toPercent,
} from '../number'

describe('isNumber', () => {
    it('returns true for numbers', () => {
        expect(isNumber(3)).toBe(true)
        expect(isNumber(0)).toBe(true)
        expect(isNumber(Infinity)).toBe(true)
        expect(isNumber(NaN)).toBe(true)
    })
    it('returns false for strings', () => {
        expect(isNumber('3')).toBe(false)
    })
})

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

describe('startEndFromNumberRanges', () => {
    it('returns start and end from typical ranges', () => {
        expect(startEndFromNumberRanges([{ from: 1, to: 5 }])).toEqual({ start: 1, end: 5 })
    })
    it('finds first non-null from and last non-null to', () => {
        expect(
            startEndFromNumberRanges([{ from: null, to: 2 }, { from: 3, to: null }, { from: 5, to: 9 }])
        ).toEqual({ start: 3, end: 9 })
    })
    it('returns undefined end when end <= start', () => {
        expect(startEndFromNumberRanges([{ from: 10, to: 5 }])).toEqual({ start: 10, end: undefined })
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

describe('rad', () => {
    it('converts degree to radians', () => {
        expect(rad(180)).toBeCloseTo(Math.PI)
        expect(rad(90)).toBeCloseTo(Math.PI / 2)
    })
})

describe('round / roundUp / roundDown', () => {
    it('rounds to given precision', () => {
        expect(round(123.4567, 3)).toBe(123.457)
        expect(round(123.4567)).toBe(123)
    })
    it('rounds up', () => {
        expect(roundUp(123.4561, 3)).toBe(123.457)
    })
    it('rounds down', () => {
        expect(roundDown(123.4569, 3)).toBe(123.456)
    })
})

describe('roundTo / roundUpTo / roundDownTo', () => {
    it('rounds to the closest multiple', () => {
        expect(roundTo(123.4567, 10)).toBe(120)
        expect(roundUpTo(123.4567, 10)).toBe(130)
        expect(roundDownTo(123.4567, 10)).toBe(120)
    })
    it('avoids floating-point artifacts', () => {
        expect(roundTo(1.2, 0.1)).toBe(1.2)
    })
})

describe('decimalPlaces', () => {
    it('counts decimal digits', () => {
        expect(decimalPlaces(1.234)).toBe(3)
        expect(decimalPlaces(10)).toBe(0)
        expect(decimalPlaces('0.1')).toBe(1)
    })
    it('adjusts for scientific notation', () => {
        expect(decimalPlaces(1e-5)).toBe(5)
    })
})

describe('greatestCommonDivisor', () => {
    it('finds gcd', () => {
        expect(greatestCommonDivisor(12, 8)).toBe(4)
        expect(greatestCommonDivisor(54, 24)).toBe(6)
    })
    it('handles zero', () => {
        expect(greatestCommonDivisor(7, 0)).toBe(7)
    })
})

describe('randomNumberInRange', () => {
    it('returns a value within the inclusive range', () => {
        for (let i = 0; i < 25; i++) {
            const v = randomNumberInRange(1, 5)
            expect(v).toBeGreaterThanOrEqual(1)
            expect(v).toBeLessThanOrEqual(5)
            expect(Number.isInteger(v)).toBe(true)
        }
    })
})

describe('toPercentage', () => {
    it('returns the percentage change', () => {
        expect(toPercentage(150, 100)).toBe(50)
        expect(toPercentage(50, 100)).toBe(-50)
    })
    it('returns 0 when both are zero', () => {
        expect(toPercentage(0, 0)).toBe(0)
    })
    it('returns Infinity when base is zero and new is positive', () => {
        expect(toPercentage(5, 0)).toBe(Infinity)
        expect(toPercentage(-5, 0)).toBe(-Infinity)
    })
    it('returns NaN for non-numeric input', () => {
        expect(Number.isNaN(toPercentage('x', 1))).toBe(true)
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
