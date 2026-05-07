import classNames from '../classNames'

describe('classNames', () => {
    it('joins string arguments', () => {
        expect(classNames('a', 'b')).toBe('a b')
    })

    it('ignores false, null, undefined', () => {
        expect(classNames('a', null, 'b', undefined, false, 'c')).toBe('a b c')
    })

    it('includes truthy object keys', () => {
        expect(classNames({ foo: true, bar: false, baz: true })).toBe('foo baz')
    })

    it('flattens arrays', () => {
        expect(classNames(['a', 'b'], 'c')).toBe('a b c')
    })

    it('handles nested arrays', () => {
        expect(classNames(['a', ['b', 'c']])).toBe('a b c')
    })

    it('merges object and string', () => {
        expect(classNames('btn', { active: true, disabled: false })).toBe('btn active')
    })

    it('accepts numbers as strings', () => {
        expect(classNames('n', 42)).toBe('n 42')
    })

    it('returns empty string when nothing applies', () => {
        expect(classNames()).toBe('')
        expect(classNames(null, false)).toBe('')
        expect(classNames({ a: false })).toBe('')
    })

    it('skips empty array entries', () => {
        expect(classNames(['a', '', 'b'])).toBe('a b')
    })
})
