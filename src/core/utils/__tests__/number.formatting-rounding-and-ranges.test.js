import {
    decimalPlaces,
    formatNumber,
    formatSI,
    greatestCommonDivisor,
    round,
    roundDown,
    roundDownTo,
    roundTo,
    roundUp,
    roundUpTo,
    shortNumber,
    startEndFromNumberRanges,
    toOrdinal,
    toPercent,
    toPercentage,
} from '../number'

describe('number utility edge contracts', () => {
    describe('startEndFromNumberRanges', () => {
        it('returns an empty result when no ranges are available', () => {
            const emptyResult = { start: undefined, end: undefined }

            expect(startEndFromNumberRanges()).toEqual(emptyResult)
            expect(startEndFromNumberRanges(null)).toEqual(emptyResult)
            expect(startEndFromNumberRanges([])).toEqual(emptyResult)
            expect(startEndFromNumberRanges([{}])).toEqual(emptyResult)
        })

        it('keeps zero as a valid boundary', () => {
            expect(startEndFromNumberRanges([{ from: null, to: 0 }, { from: 0, to: 5 }])).toEqual({
                start: 0,
                end: 5,
            })
            expect(startEndFromNumberRanges([{ to: 4 }, { from: 0 }])).toEqual({ start: 0, end: 4 })
        })

        it('discards equal and reversed final boundaries', () => {
            expect(startEndFromNumberRanges([{ from: 0, to: 0 }])).toEqual({ start: 0, end: undefined })
            expect(startEndFromNumberRanges([{ from: 10, to: 20 }, { from: 20, to: 5 }])).toEqual({
                start: 10,
                end: undefined,
            })
        })
    })

    describe('formatNumber', () => {
        it('supports independent grouping sizes and delimiters', () => {
            expect(formatNumber(12345678.9, {
                decimals: 2,
                sectionDelimiter: ' ',
                decimalDelimiter: ',',
            })).toBe('12 345 678,90')
            expect(formatNumber(123456, { delimits: 2, sectionDelimiter: '_' })).toBe('12_34_56')
        })

        it('normalizes numeric strings before formatting them', () => {
            expect(formatNumber('001234.50')).toBe('1,234.5')
            expect(formatNumber('-001234.5', {
                decimals: 2,
                sectionDelimiter: '.',
                decimalDelimiter: ',',
            })).toBe('-1.234,50')
        })

        it('removes negative zero with a custom decimal delimiter', () => {
            expect(formatNumber(-0.004, { decimals: 2, decimalDelimiter: ',' })).toBe('0,00')
        })

        it('uses the numeric value when choosing an ordinal suffix', () => {
            expect(formatNumber('22', { ordinal: true })).toBe('22nd')
            expect(formatNumber('1231', { ordinal: true })).toBe('1,231st')
            expect(formatNumber('-21', { ordinal: true })).toBe('-21st')
            expect(toOrdinal(-102)).toBe('-102nd')
        })
    })

    describe('shortNumber and formatSI', () => {
        it('uses defaults for numeric strings and values below the divider', () => {
            expect(shortNumber('1500')).toBe('1.5k')
            expect(shortNumber('12.34')).toBe('12.3')
            expect(shortNumber(-12.345, 4)).toBe('-12.35')
        })

        it('supports binary dividers, custom delimiters, and custom suffixes', () => {
            const suffixes = { 0: 'B', 3: 'KiB' }

            expect(formatSI(2048, 3, 1024, ' ', suffixes)).toBe('2 KiB')
            expect(shortNumber(-2048, 3, 1024, ' ', suffixes)).toBe('-2 KiB')
        })

        it('caps the largest SI exponent without losing the remaining magnitude', () => {
            expect(formatSI(1e27)).toBe('1000Y')
            expect(formatSI(1e30)).toBe('1000000Y')
            expect(formatSI(-1e30, 3, 1000, ' ')).toBe('-1000000 Y')
        })

        it('caps tiny values at the smallest SI exponent', () => {
            expect(formatSI(1e-24)).toBe('1y')
            expect(formatSI(1e-30)).toBe('0.000001y')
            expect(formatSI(-1e-30)).toBe('-0.000001y')
        })

        it('uses default suffixes and delimiters across positive and negative exponents', () => {
            expect(formatSI(1e21)).toBe('1Z')
            expect(formatSI(1e-6)).toBe('1µ')
            expect(formatSI(1)).toBe('1')
        })

        it.each([Infinity, -Infinity, NaN])('does not attach a suffix to non-finite value %s', value => {
            expect(shortNumber(value)).toBe(String(value))
            expect(formatSI(value)).toBe(String(value))
        })
    })

    describe('rounding defaults', () => {
        it('rounds decimal values to whole numbers when precision is omitted', () => {
            expect(round(1.6)).toBe(2)
            expect(roundUp(1.01)).toBe(2)
            expect(roundDown(1.99)).toBe(1)
        })

        it('uses one as the default multiple', () => {
            expect(roundTo(12.6)).toBe(13)
            expect(roundUpTo(12.01)).toBe(13)
            expect(roundDownTo(12.99)).toBe(12)
        })

        it('supports negative precision and exact decimal multiples', () => {
            expect(round(149, -2)).toBe(100)
            expect(roundUp(101, -2)).toBe(200)
            expect(roundDown(199, -2)).toBe(100)
            expect(roundUpTo(1.2, 0.1)).toBe(1.2)
            expect(roundDownTo(1.2, 0.1)).toBe(1.2)
        })
    })

    describe('decimal, divisor, and percent edge inputs', () => {
        it('counts normalized decimals and scientific notation', () => {
            expect(decimalPlaces(-1.23)).toBe(2)
            expect(decimalPlaces('1.2300')).toBe(2)
            expect(decimalPlaces(1.2e-7)).toBe(8)
            expect(decimalPlaces(1.2e3)).toBe(0)
            expect(decimalPlaces(NaN)).toBe(0)
            expect(decimalPlaces(Infinity)).toBe(0)
            expect(decimalPlaces(null)).toBe(0)
        })

        it('returns a positive divisor for negative and numeric-string inputs', () => {
            expect(greatestCommonDivisor(-54, 24)).toBe(6)
            expect(greatestCommonDivisor(24, -54)).toBe(6)
            expect(greatestCommonDivisor('54', '24')).toBe(6)
            expect(greatestCommonDivisor('7', '0')).toBe(7)
            expect(greatestCommonDivisor(0, 7)).toBe(7)
        })

        it('uses the established infinity sentinel when a divisor is undefined', () => {
            expect(greatestCommonDivisor(0, 0)).toBe(Infinity)
            expect(greatestCommonDivisor('invalid', 2)).toBe(Infinity)
        })

        it('handles numeric-string zero consistently in percentage changes', () => {
            expect(toPercentage('150', '100')).toBe(50)
            expect(toPercentage('0', '0')).toBe(0)
            expect(toPercentage('5', '0')).toBe(Infinity)
            expect(toPercentage('-5', '0')).toBe(-Infinity)
        })

        it('formats signed numeric strings and rejects non-finite percentages', () => {
            expect(toPercent('0.125')).toBe('13%')
            expect(toPercent('0.125', 1)).toBe('12.5%')
            expect(toPercent('-0.5')).toBe('-50%')
            expect(toPercent(Infinity)).toBe('')
            expect(toPercent(null)).toBe('')
        })
    })
})
