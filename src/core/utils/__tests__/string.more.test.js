import {
    isInString,
    isInStringAny,
    insertToString,
    isBase64,
    isFileSrc,
    isString,
    formatKeyPath,
    fileFormat,
    fileFormatNormalized,
    fileNameWithoutExt,
    fileFromDataUrl,
    mimeTypeFromDataUrl,
    hostname,
    matchBetween,
    mergeStrings,
    padStringLeft,
    padStringRight,
    pluralize,
    toHex,
    toAlphaNum,
    toAlphaNumId,
    toURI,
    truncate,
    toLowerCase,
    toLowerCaseAny,
    toUpperCase,
    toUpperCaseAny,
    trimSpaces,
    uuid,
    randomFromString,
    randomString,
    sha256,
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

describe('isInStringAny', () => {
    it('returns true if any needle matches', () => {
        expect(isInStringAny('hello world', 'foo', 'world')).toBe(true)
    })
    it('returns false if none match', () => {
        expect(isInStringAny('hello', 'x', 'y')).toBe(false)
    })
    it('returns false if first arg is not a string', () => {
        expect(isInStringAny(null, 'x')).toBe(false)
        expect(isInStringAny(undefined, 'x')).toBe(false)
        expect(isInStringAny(42, 'x')).toBe(false)
    })
})

describe('insertToString', () => {
    it('inserts at a positive index', () => {
        expect(insertToString('hello', 2, 'XX')).toBe('heXXllo')
    })
    it('prepends at index 0', () => {
        expect(insertToString('hello', 0, '>')).toBe('>hello')
    })
})

describe('isBase64', () => {
    it('returns true for valid base64 strings', () => {
        expect(isBase64('aGVsbG8=')).toBe(true)
        expect(isBase64('YWJjZA==')).toBe(true)
    })
    it('returns false for invalid base64', () => {
        expect(isBase64('not base 64!')).toBe(false)
    })
})

describe('isFileSrc', () => {
    it('returns true if string contains a dot', () => {
        expect(isFileSrc('image.png')).toBe(true)
        expect(isFileSrc('https://x.com/y.jpg')).toBe(true)
    })
    it('returns false for strings without a dot', () => {
        expect(isFileSrc('abc')).toBe(false)
    })
    it('returns false for falsy input', () => {
        expect(isFileSrc('')).toBe(false)
        expect(isFileSrc(null)).toBeFalsy()
        expect(isFileSrc(undefined)).toBeFalsy()
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

describe('formatKeyPath', () => {
    it('converts bracket notation to dot notation', () => {
        expect(formatKeyPath('object[string]')).toBe('object.string')
    })
    it('does not add a dot when bracket starts the string', () => {
        expect(formatKeyPath('[0]')).toBe('0')
    })
    it('handles multiple bracket segments', () => {
        expect(formatKeyPath('a[b][c]')).toBe('a.b.c')
    })
})

describe('fileFormat', () => {
    it('returns the extension', () => {
        expect(fileFormat('image.png')).toBe('png')
    })
    it('returns the last extension for multi-dot names', () => {
        expect(fileFormat('archive.tar.gz')).toBe('gz')
    })
    it('returns empty string when there is no extension', () => {
        expect(fileFormat('noext')).toBe('')
    })
})

describe('fileFormatNormalized', () => {
    it('normalizes jpeg/jpg to jpg', () => {
        expect(fileFormatNormalized('photo.jpeg')).toBe('jpg')
        expect(fileFormatNormalized('photo.JPG')).toBe('jpg')
    })
    it('returns the extension as-is for other types', () => {
        expect(fileFormatNormalized('doc.PDF')).toBe('pdf')
    })
    it('returns undefined for falsy input', () => {
        expect(fileFormatNormalized('')).toBeUndefined()
        expect(fileFormatNormalized(null)).toBeUndefined()
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

describe('mimeTypeFromDataUrl', () => {
    it('extracts mime type', () => {
        expect(mimeTypeFromDataUrl('data:image/png;base64,iVBOR...')).toBe('image/png')
    })
})

describe('fileFromDataUrl', () => {
    it('decodes a base64 data URL to a File', () => {
        // "Hi!" → "SGkh"
        const dataUrl = 'data:text/plain;base64,SGkh'
        const file = fileFromDataUrl(dataUrl, 'note.txt')
        expect(file.name).toBe('note.txt')
        expect(file.type).toBe('text/plain')
        expect(file.size).toBe(3)
    })
})

describe('hostname', () => {
    it('extracts hostname with protocol', () => {
        expect(hostname('https://example.com/path')).toBe('example.com')
    })
    it('extracts hostname without protocol', () => {
        expect(hostname('example.com/path')).toBe('example.com')
    })
    it('strips port', () => {
        expect(hostname('https://example.com:8080/x')).toBe('example.com')
    })
    it('strips query', () => {
        expect(hostname('example.com?q=1')).toBe('example.com')
    })
})

describe('matchBetween', () => {
    it('finds the substring between markers', () => {
        expect(matchBetween('cool_black__hat', '_', '__')).toBe('black')
    })
    it('returns empty string when no match', () => {
        expect(matchBetween('abcdef', 'X', 'Y')).toBe('')
    })
})

describe('mergeStrings', () => {
    it('produces a deterministic scrambled result', () => {
        const out = mergeStrings('ab', 'xyz')
        expect(typeof out).toBe('string')
        expect(out.length).toBeGreaterThan(0)
        expect(mergeStrings('ab', 'xyz')).toBe(out)
    })
    it('handles numeric inputs', () => {
        expect(typeof mergeStrings(12, 34)).toBe('string')
    })
    it('handles strings of equal length', () => {
        const out = mergeStrings('ab', 'cd')
        expect(typeof out).toBe('string')
        expect(out.length).toBe(4)
    })
    it('handles when first is shorter than second', () => {
        const out = mergeStrings('a', 'xyz')
        expect(typeof out).toBe('string')
    })
})

describe('padStringLeft / padStringRight', () => {
    it('pads left with the template', () => {
        expect(padStringLeft('7', '000')).toBe('007')
    })
    it('pads right with the template', () => {
        expect(padStringRight('7', '000')).toBe('700')
    })
    it('returns longer input untouched (left)', () => {
        expect(padStringLeft('1234', '00')).toBe('1234')
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

describe('toHex / toAlphaNum / toAlphaNumId / toURI', () => {
    it('encodes a simple string to hex', () => {
        expect(toHex('A')).toMatch(/^[0-9a-f]+$/)
    })
    it('strips non-alphanumeric characters', () => {
        expect(toAlphaNum('a-b_c.d!')).toBe('abcd')
    })
    it('keeps dash and underscore in toAlphaNumId', () => {
        expect(toAlphaNumId('a-b_c.d!')).toBe('a-b_cd')
    })
    it('sanitizes string to URI form', () => {
        expect(toURI('Hello World! Foo  Bar')).toBe('hello-world-foo-bar')
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
    it('toLowerCase / toUpperCase preserve falsy', () => {
        expect(toLowerCase('')).toBe('')
        expect(toUpperCase('')).toBe('')
        expect(toLowerCase(null)).toBe(null)
    })
    it('toLowerCase / toUpperCase work on strings', () => {
        expect(toLowerCase('ABc')).toBe('abc')
        expect(toUpperCase('aBc')).toBe('ABC')
    })
    it('toLowerCaseAny / toUpperCaseAny coerce', () => {
        expect(toLowerCaseAny(123)).toBe('123')
        expect(toUpperCaseAny(true)).toBe('TRUE')
    })
})

describe('trimSpaces', () => {
    it('trims and collapses multiple-whitespace runs', () => {
        expect(trimSpaces('  a   b  c  ')).toBe('a b c')
    })
    it('returns falsy input as-is', () => {
        expect(trimSpaces('')).toBe('')
        expect(trimSpaces(null)).toBe(null)
    })
})

describe('uuid', () => {
    it('returns a v4 uuid', () => {
        const id = uuid()
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })
    it('returns unique values', () => {
        const a = uuid()
        const b = uuid()
        expect(a).not.toBe(b)
    })
})

describe('randomFromString / randomString', () => {
    it('randomFromString returns a single char from input', () => {
        const out = randomFromString('abc')
        expect('abc').toContain(out)
    })
    it('randomString respects length range with alphaNum', () => {
        const out = randomString(8, 8, { alphaNum: true })
        expect(out).toHaveLength(8)
        expect(/^[0-9a-zA-Z]+$/.test(out)).toBe(true)
    })
    it('randomString respects length range with hex', () => {
        const out = randomString(16, 16, { hex: true })
        expect(out).toHaveLength(16)
        expect(/^[0-9a-f]+$/.test(out)).toBe(true)
    })
})

describe('sha256', () => {
    it('hashes the empty string to a known digest', () => {
        expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    })
    it('hashes "abc" to a known digest', () => {
        expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    })
})

describe('capitalize re-export', () => {
    it('capitalizes the first letter', () => {
        expect(capitalize('hello')).toBe('Hello')
    })
})
