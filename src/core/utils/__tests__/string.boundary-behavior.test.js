import {
  interpolateString,
  mergeStrings,
  pluralize,
  randomString,
  sha256,
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

  describe('mergeStrings', () => {
    it('uses characters from both inputs when their lengths are equal', () => {
      expect(mergeStrings('ab', 'cd')).toBe('bcad')
    })

    it('returns the reversed non-empty input without leaking undefined text', () => {
      expect(mergeStrings('abc', '')).toBe('cba')
      expect(mergeStrings('', 'xyz')).toBe('zyx')
      expect(mergeStrings('', '')).toBe('')
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

  describe('randomString deterministic modes', () => {
    afterEach(() => jest.restoreAllMocks())

    it('uses the default length range and character mode', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5)

      expect(randomString()).toBe('i'.repeat(48))
    })

    it('generates deterministic lowercase hexadecimal characters', () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.999)

      expect(randomString(3, 3, {hex: true})).toBe('08f')
    })

    it('selects from the symbol search space in the default mode', () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)

      expect(randomString(1, 1)).toBe('~')
    })

    it('generates uppercase alphanumeric characters above the uppercase threshold', () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.999)

      expect(randomString(1, 1, {alphaNum: true})).toBe('Z')
    })
  })

  describe('sha256 input contract', () => {
    it('rejects Unicode characters outside the documented single-byte range', () => {
      expect(sha256('check ✓')).toBeUndefined()
    })
  })

  describe('truncate defaults', () => {
    it('uses the default total length and trailing character count', () => {
      expect(truncate('abcdefghijklmnop')).toBe('abcdefghi...nop')
    })
  })
})
