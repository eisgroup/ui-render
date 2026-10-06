import {
  interpolateString,
  pluralize,
  truncate,
} from '../string'

describe('string edge contracts', () => {
  describe('interpolateString defaults and error handling', () => {
    it('uses empty variables and options when both optional arguments are omitted', () => {
      expect(interpolateString('plain text')).toBe('plain text')
      expect(() => interpolateString('{missing}')).toThrow(
        "interpolateString() expects variable 'missing', got 'undefined'"
      )
    })

    it('leaves an unresolved placeholder intact when errors are suppressed with default variables', () => {
      expect(interpolateString('before {missing} after', undefined, {suppressError: true}))
        .toBe('before {missing} after')
    })
  })

  describe('irregular word case preservation', () => {
    it.each([
      ['uppercase', 'GOOSE', 'GEESE'],
      ['title case', 'Goose', 'Geese'],
      ['lowercase', 'goose', 'geese'],
    ])('preserves %s', (_case, source, expected) => {
      expect(pluralize(source, 2)).toBe(expected)
    })

    it('does not modify an irregular singular and singularizes an -ies word', () => {
      expect(pluralize('mouse', 1)).toBe('mouse')
      expect(pluralize('cities', 1)).toBe('city')
    })
  })

  describe('truncate defaults', () => {
    it('uses the default total length and trailing character count', () => {
      expect(truncate('abcdefghijklmnop')).toBe('abcdefghi...nop')
    })
  })
})
