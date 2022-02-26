import {
  escapeRegExp,
  fileNameWithoutExt,
  formatKeyPath,
  getParamByKey,
  insertToString,
  interpolateString,
  isInString,
  isIpAddress,
  isPhoneNumber,
  randomString,
  regexExp,
  sha256,
  toURI,
  truncate
} from '../string'

const NON_STRING_VALUES = [
  100,
  1.1,
  0.0,
  1e10,
  1e-10,
  Infinity,
  -Infinity,
  NaN,
  [],
  {},
  null,
  undefined
]

it(`${escapeRegExp.name}() returns escaped string ready for RegexExp use`, () => {
  expect(escapeRegExp('a | b')).toEqual('a \\| b')
  expect(escapeRegExp('a \\ b')).toEqual('a \\\\ b')
})

it(`${regexExp.name}() returns escaped string RegexExp`, () => {
  expect(regexExp('a | b')).toEqual(/a \| b/)
  expect(regexExp('a \\ b', 'i')).toEqual(/a \\ b/i)
})

it(`${isInString.name}() returns true when match found, else false`, () => {
  expect(isInString('God', 'o')).toBe(true)
  expect(isInString('God', 'Go')).toBe(true)
  expect(isInString('God', 'go')).toBe(false)
})

it(`${insertToString.name}() creates new string correctly`, () => {
  expect(insertToString('Oh God!', 2, ' my')).toEqual('Oh my God!')
  expect(insertToString('cool', 0, 'I am ')).toEqual('I am cool')
})

it(`${isIpAddress.name}() returns true if given value is a valid IP address`, () => {
  expect(isIpAddress('198.67.10.1')).toBe(true)
  expect(isIpAddress('255.255.0.0')).toBe(true)
  expect(isIpAddress('256.255.0.0')).toBe(false)
  expect(isIpAddress('2001:db8:0:1234:0:567:8:1')).toBe(true)
  expect(isIpAddress('0000:0000:0000:0000:0000:0000:0000:0001')).toBe(true)
  expect(isIpAddress('peanut butter')).toBe(false)
  expect(isIpAddress('')).toBe(false)
  NON_STRING_VALUES.forEach((val) => {
    expect(isIpAddress(val)).toBe(false)
  })
})

it(`${isPhoneNumber.name}() returns true if given value is a valid telephone number`, () => {
  expect(isPhoneNumber('')).toBe(false)
  expect(isPhoneNumber('+')).toBe(false)
  expect(isPhoneNumber('79255553355')).toBe(false)
  expect(isPhoneNumber('+79255553355')).toBe(true)
  expect(isPhoneNumber('+7 (925) 555-33-55')).toBe(true)
})

it(`${formatKeyPath.name}() formats square brackets correctly`, () => {
  const path = 'path'
  expect(formatKeyPath(`key[${path}][0]`)).toEqual('key.path.0')
  expect(formatKeyPath(`[0].key[${path}]`)).toEqual('0.key.path')
  expect(formatKeyPath(`[0].key[${path}][${path}]`)).toEqual('0.key.path.path')
})

it(`${fileNameWithoutExt.name}() returns file name without extension`, () => {
  expect(fileNameWithoutExt('exchange.csv')).toEqual('exchange')
  expect(fileNameWithoutExt('exchange.test.csv')).toEqual('exchange.test')
})

it(`${sha256.name}() hashes string correctly to 64 characters long`, () => {
  expect(sha256(randomString()).length).toEqual(64)
})

it(`${toURI.name}() returns sanitized AlphaNumericHyphen string for use in browser URL`, () => {
  expect(toURI('')).toEqual('')
  expect(toURI(' Test dot.   count!?123 4567*&^%  \n"')).toEqual('test-dot-count-123-4567')
  expect(toURI('\n Test dot.   count!?123 4567*&^%  \n"')).toEqual('test-dot-count-123-4567')
  expect(toURI('\n Test dot.   count!?\n123 4567*&^%  \n\n"')).toEqual('test-dot-count-123-4567')
  expect(toURI('\n Test dot. \tcount!?\n123 4567*&^%  \n\n"')).toEqual('test-dot-count-123-4567')
})

it(`${truncate.name}() return shortened string with ellipses and last n characters`, () => {
  const string = 'cleopatra'
  expect(truncate('zeus', 7)).toEqual('zeus')
  expect(truncate(string, 6)).toEqual('cleopatra')
  expect(truncate(string, 7)).toEqual('c...tra')
  expect(truncate(string, 8)).toEqual('cl...tra')
  expect(truncate(string, 8, 2)).toEqual('cle...ra')
  expect(truncate(string, 9)).toEqual('cleopatra')
})

describe(`${getParamByKey.name}() works`, () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test with query string', queryString)
  })
  afterEach(() => {
    window.history.pushState({}, 'Home', '/')  // reset URL back to original state
  })

  const queryString = '?foo=man&bar=&baz'
  const url = 'https://example.com' + queryString

  it(`${getParamByKey.name}() returns query string value correctly when given URL`, () => {
    expect(getParamByKey('foo', url)).toEqual('man')
    expect(getParamByKey('bar', url)).toEqual('')
    expect(getParamByKey('baz', url)).toEqual('')
    expect(getParamByKey('doesNotExist', url)).toEqual(undefined)
  })

  it(`${getParamByKey.name}() returns query string value correctly from browser URL`, () => {
    expect(getParamByKey('foo')).toEqual('man')
    expect(getParamByKey('bar')).toEqual('')
    expect(getParamByKey('baz')).toEqual('')
    expect(getParamByKey('doesNotExist')).toEqual(undefined)
  })
})

describe(`${interpolateString.name}()`, () => {
  const template = 'Hidden {SECRET} {SER_VICE}'

  it(`replaces template placeholders with given variables`, () => {
    expect(interpolateString(template, {SECRET: 'Pure', SER_VICE: 'Heart'})).toEqual('Hidden Pure Heart')
  })

  it(`replaces template variables without affecting '{' and '}' characters`, () => {
    let template = 'Hidden {{SECRET} {SER_VICE}}'
    expect(interpolateString(template, {SECRET: 'Pure', SER_VICE: 'Heart'})).toEqual('Hidden {Pure Heart}')
    template = 'Hidden {SECRET} {SER_VICE} {}'
    expect(interpolateString(template, {SECRET: 'Pure', SER_VICE: 'Heart'})).toEqual('Hidden Pure Heart {}')
  })

  it(`replaces template variables using special key format`, () => {
    expect(interpolateString(template, {'{SECRET}': 'Pure', '{SER_VICE}': 'Heart'}, {formatKey: '{key}'}))
      .toEqual('Hidden Pure Heart')
  })

  it(`replaces variables with key path`, () => {
    const template = 'Hidden {state.user.id}'
    expect(interpolateString(template, {state: {user: {id: 'Within'}}})).toEqual('Hidden Within')
  })

  it(`replaces variables with fallback value when not found`, () => {
    const template = 'Hidden {state.user.id,0}'
    expect(interpolateString(template, {})).toEqual('Hidden 0')
  })

  it(`throws error for missing variables`, () => {
    expect(() => interpolateString(template, {SECRET: 'Pure', SERVICE: 'Heart'})).toThrow(/'SER_VICE'/)
  })

  it(`leaves string as is for missing variables when error is suppressed`, () => {
    const template = 'Hidden {$SECRET} {SER_VICE}'
    expect(interpolateString(template, {}, {suppressError: true})).toEqual(template)
  })
})
