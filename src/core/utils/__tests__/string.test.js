import { interpolateString } from '../string'

describe('interpolateString', () => {
    it('interpolates a basic placeholder', () => {
        expect(interpolateString('{id}', { id: 42 })).toBe('42')
    })

    it('interpolates a nested path like {state.optionX}', () => {
        expect(interpolateString('{state.optionX}', { state: { optionX: 1 } })).toBe('1')
    })

    it('uses fallback when value is undefined: {state.optionX,0}', () => {
        expect(interpolateString('{state.optionX,0}', { state: {} })).toBe('0')
    })

    it('interpolates multiple placeholders', () => {
        const result = interpolateString(
            'Options.{state.option,0}.Categories.{state.category,0}',
            { state: { option: 2, category: 1 } },
        )
        expect(result).toBe('Options.2.Categories.1')
    })

    it('leaves placeholder when key missing and suppressError is true', () => {
        expect(
            interpolateString('{missingKey}', {}, { suppressError: true }),
        ).toBe('{missingKey}')
    })

    it('throws when key is missing and suppressError is false', () => {
        expect(() => interpolateString('{missingKey}', {})).toThrow()
    })
})
