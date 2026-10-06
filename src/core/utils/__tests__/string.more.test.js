import {
  isInString,
  isString,
  fileNameWithoutExt,
  pluralize,
  toAlphaNumId,
  truncate,
  toLowerCase,
  capitalize,
} from '../string'

describe('isInString', () => {
    it('returns true when needle is in haystack', () => {
        expect(isInString('hello world', 'world')).toBe(true)
    })
    it('returns false when needle is absent', () => {
        expect(isInString('hello', 'xyz')).toBe(false)
    })
})

describe('isString', () => {
    it('returns true for string values', () => {
        expect(isString('hello')).toBe(true)
        expect(isString('')).toBe(true)
    })
    it('returns false for non-strings', () => {
        expect(isString(42)).toBe(false)
        expect(isString(null)).toBe(false)
        expect(isString({})).toBe(false)
    })
})

describe('fileNameWithoutExt', () => {
    it('strips the extension', () => {
        expect(fileNameWithoutExt('photo.jpg')).toBe('photo')
    })
    it('leaves names without extension unchanged', () => {
        expect(fileNameWithoutExt('photo')).toBe('photo')
    })
})

describe('pluralize', () => {
    it('keeps singular when count is 1', () => {
        expect(pluralize('cat', 1)).toBe('cat')
    })
    it('pluralizes when count is not 1', () => {
        expect(pluralize('cat', 2)).toBe('cats')
        expect(pluralize('cat')).toBe('cats')
    })
    it('handles y → ies', () => {
        expect(pluralize('city', 3)).toBe('cities')
    })
    it('handles -s/-x/-z/-ch/-sh → -es', () => {
        expect(pluralize('bus', 2)).toBe('buses')
        expect(pluralize('box', 2)).toBe('boxes')
        expect(pluralize('match', 2)).toBe('matches')
    })
    it('handles irregular forms', () => {
        expect(pluralize('child', 2)).toBe('children')
        expect(pluralize('person', 2)).toBe('people')
        expect(pluralize('children', 1)).toBe('child')
        expect(pluralize('people', 1)).toBe('person')
    })
    it('preserves case for irregular forms', () => {
        expect(pluralize('Child', 2)).toBe('Children')
        expect(pluralize('CHILD', 2)).toBe('CHILDREN')
    })
    it('keeps uncountable words unchanged', () => {
        expect(pluralize('sheep', 5)).toBe('sheep')
        expect(pluralize('fish', 1)).toBe('fish')
    })
    it('includes the count when shouldIncludeCount is true', () => {
        expect(pluralize('cat', 3, true)).toBe('3 cats')
    })
    it('singularizes -ses/-xes/-ches/-shes', () => {
        expect(pluralize('buses', 1)).toBe('bus')
        expect(pluralize('boxes', 1)).toBe('box')
        expect(pluralize('matches', 1)).toBe('match')
    })
    it('treats irregular plural as already plural (no double-pluralize)', () => {
        // 'children' is already plural form of 'child'
        expect(pluralize('children', 5)).toBe('children')
    })
    it('keeps -ss words unchanged when singularizing', () => {
        // 'class' ends in 'ss' which is NOT trimmed
        expect(pluralize('class', 1)).toBe('class')
    })
    it('singularizes a plain -s word', () => {
        expect(pluralize('cats', 1)).toBe('cat')
    })
})

describe('toAlphaNumId', () => {
    it('keeps dash and underscore in toAlphaNumId', () => {
        expect(toAlphaNumId('a-b_c.d!')).toBe('a-b_cd')
    })
})

describe('truncate', () => {
    it('returns the string unchanged if shorter than length', () => {
        expect(truncate('short', 15)).toBe('short')
    })
    it('truncates with ellipsis preserving last N chars', () => {
        const out = truncate('abcdefghijklmnop', 10, 3)
        expect(out).toContain('...')
        expect(out.endsWith('nop')).toBe(true)
    })
    it('returns original if firstChars < 1', () => {
        expect(truncate('abcdef', 4, 3)).toBe('abcdef')
    })
})

describe('case conversion', () => {
    it('toLowerCase preserves falsy', () => {
        expect(toLowerCase('')).toBe('')
        expect(toLowerCase(null)).toBe(null)
    })
    it('toLowerCase works on strings', () => {
        expect(toLowerCase('ABc')).toBe('abc')
    })
})

describe('capitalize re-export', () => {
    it('capitalizes the first letter', () => {
        expect(capitalize('hello')).toBe('Hello')
    })
})
