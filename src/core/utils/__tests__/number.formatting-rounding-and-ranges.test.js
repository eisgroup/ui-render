import {
  formatNumber,
  formatSI,
  round,
  shortNumber,
  toOrdinal,
  toPercent,
} from '../number'

describe('number utility edge contracts', () => {
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
        })

        it('supports negative precision', () => {
            expect(round(149, -2)).toBe(100)
        })
    })

    describe('percent edge inputs', () => {
        it('formats signed numeric strings and rejects non-finite percentages', () => {
            expect(toPercent('0.125')).toBe('13%')
            expect(toPercent('0.125', 1)).toBe('12.5%')
            expect(toPercent('-0.5')).toBe('-50%')
            expect(toPercent(Infinity)).toBe('')
            expect(toPercent(null)).toBe('')
        })
    })
})
