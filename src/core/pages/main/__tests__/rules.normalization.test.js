// Loading rules registers the normalization contract used by meta definitions.
import '../rules'
import { FIELD } from '../../../modules/variables'

describe('rules meta normalization contract', () => {
    it('normalizes date values to the public YYYY-MM-DD data format', () => {
        expect(FIELD.NORMALIZER.date('2024-02-03T12:00:00.000Z')).toBe('2024-02-03')
        expect(FIELD.NORMALIZER.date(null)).toBeUndefined()
    })

    it('normalizes currency values to two decimal places', () => {
        expect(FIELD.NORMALIZER.currency(12)).toBe('12.00')
        expect(FIELD.NORMALIZER.currency('12.345')).toBe('12.35')
        expect(FIELD.NORMALIZER.currency('')).toBe('0.00')
        expect(FIELD.NORMALIZER.currency(null)).toBeNull()
    })

    it('converts stored decimal percentages to display percentages', () => {
        expect(FIELD.NORMALIZER.percent(0)).toBe('0')
        expect(FIELD.NORMALIZER.percent(0.125)).toBe('12.5')
        expect(FIELD.NORMALIZER.percent(undefined)).toBeUndefined()
    })

    it('parses display percentages back to the stored decimal value', () => {
        expect(FIELD.PARSER.percent(12.34567)).toBe(0.12346)
        expect(FIELD.PARSER.percent(0)).toBe(0)
        expect(FIELD.PARSER.percent('')).toBe('')
    })
})
