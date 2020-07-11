import {
  createIncrementCounter,
  decimalPlaces,
  formatNumber,
  greatestCommonDivisor,
  isContinuousNumberRanges,
  isNumber,
  isNumeric,
  roundDownTo,
  roundTail,
  roundTo,
  roundUpTo,
  shortNumber,
  startEndFromNumberRanges,
  toPercentage
} from '../number'

const NUMBER_VALUES = [
  1,
  1.1,
  0.0,
  0,
  1e7,
  1e-7,
  Infinity,
  -Infinity,
  NaN
]
const NON_NUMBER_VALUES = [
  null,
  undefined,
  'foo',
  '',
  [],
  {}
]
const NUMERIC_VALUES = [
  1,
  1.1,
  0.0,
  0,
  1e7,
  1e-7,
  '1',
  '1.1',
  '0.0',
  '0'
]
const NON_NUMERIC_VALUES = [
  ...NON_NUMBER_VALUES,
  Infinity,
  -Infinity,
  NaN,
  '1a',
  '0.0b'
]

it(`${createIncrementCounter.name}() increments counts correctly`, () => {
  const addCount = createIncrementCounter(7)
  expect(addCount()).toEqual(8)
  expect(addCount(0)).toEqual(0)
  expect(addCount(2)).toEqual(2)
  expect(addCount(-2)).toEqual(0)
})

it(`${formatNumber.name}() outputs correct string`, () => {
  const europeanStyle = { sectionDelimiter: '.', decimalDelimiter: ',' }
  expect(formatNumber('Not a number')).toEqual('Not a number')
  expect(formatNumber('77777.00001')).toEqual('77,777.00001')
  expect(formatNumber('-77777.00001')).toEqual('-77,777.00001')
  expect(formatNumber(77777.00001)).toEqual('77,777.00001')
  expect(formatNumber(-77777.00001)).toEqual('-77,777.00001')
  expect(formatNumber('7777777')).toEqual('7,777,777')
  expect(formatNumber('-7777777')).toEqual('-7,777,777')
  expect(formatNumber(7777777)).toEqual('7,777,777')
  expect(formatNumber(-7777777)).toEqual('-7,777,777')
  expect(formatNumber('0')).toEqual('0')
  expect(formatNumber(0)).toEqual('0')
  expect(formatNumber('0.00007')).toEqual('0.00007')
  expect(formatNumber('-0.00007')).toEqual('-0.00007')
  expect(formatNumber(0.00007)).toEqual('0.00007')
  expect(formatNumber(-0.00007)).toEqual('-0.00007')
  expect(formatNumber('1.1', { decimals: 2 })).toEqual('1.10')
  expect(formatNumber(1.1, { decimals: 2 })).toEqual('1.10')
  expect(formatNumber('77777.00001', { decimals: 2, delimits: 3, ...europeanStyle })).toEqual('77.777,00')
  expect(formatNumber('-77777.00001', { decimals: 2, delimits: 3, ...europeanStyle })).toEqual('-77.777,00')
  expect(formatNumber(77777.00001, { decimals: 2, delimits: 3, ...europeanStyle })).toEqual('77.777,00')
  expect(formatNumber(-77777.00001, { decimals: 2, delimits: 3, ...europeanStyle })).toEqual('-77.777,00')
  expect(formatNumber('7777777', { decimals: 2, delimits: 5, ...europeanStyle })).toEqual('77.77777,00')
  expect(formatNumber('-7777777', { decimals: 2, delimits: 5, ...europeanStyle })).toEqual('-77.77777,00')
  expect(formatNumber(7777777, { decimals: 2, delimits: 5, ...europeanStyle })).toEqual('77.77777,00')
  expect(formatNumber(-7777777, { decimals: 2, delimits: 5, ...europeanStyle })).toEqual('-77.77777,00')
  expect(formatNumber('0', { decimals: 2, delimits: 3 })).toEqual('0.00')
  expect(formatNumber(0, { decimals: 2, delimits: 3 })).toEqual('0.00')
  expect(formatNumber('0.00007', { decimals: 0, delimits: 3 })).toEqual('0')
  expect(formatNumber('-0.00007', { decimals: 4, delimits: 3 })).toEqual('-0.0001')
  expect(formatNumber('-0.00007', { decimals: 3, delimits: 3 })).toEqual('0.000')
  expect(formatNumber('-0.00007', { decimals: 0, delimits: 3 })).toEqual('0')
  expect(formatNumber(0.00007, { decimals: 0, delimits: 3 })).toEqual('0')
  expect(formatNumber(-0.00007, { decimals: 4, delimits: 3 })).toEqual('-0.0001')
  expect(formatNumber(-0.00007, { decimals: 3, delimits: 3 })).toEqual('0.000')
  expect(formatNumber(-0.00007, { decimals: 0, delimits: 3 })).toEqual('0')
  expect(formatNumber(0.00007, { decimals: 0, delimits: 3, ordinal: true })).toEqual('0th')
  expect(formatNumber(-0.00007, { decimals: 0, delimits: 3, ordinal: true })).toEqual('0th')
})

it(`${shortNumber.name}() formats number correctly`, () => {
  expect(shortNumber(1)).toEqual('1')
  expect(shortNumber(10)).toEqual('10')
  expect(shortNumber(100)).toEqual('100')
  expect(shortNumber(999)).toEqual('999')
  expect(shortNumber(1, 3)).toEqual('1')
  expect(shortNumber(12, 3)).toEqual('12')
  expect(shortNumber(123, 3)).toEqual('123')
  expect(shortNumber(1234, 3)).toEqual('1.23k')
  expect(shortNumber(12345, 3)).toEqual('12.3k')
  expect(shortNumber(123456, 3)).toEqual('123k')
  expect(shortNumber(1234567, 3)).toEqual('1.23M')
  expect(shortNumber(12345678, 3)).toEqual('12.3M')
  expect(shortNumber(123456789, 3)).toEqual('123M')
  expect(shortNumber(1234567890, 3)).toEqual('1.23B')
  expect(shortNumber(1235567890, 3)).toEqual('1.24B')
  expect(shortNumber(1100000000, 3)).toEqual('1.1B')
  expect(shortNumber(1000000000, 3)).toEqual('1B')
  expect(shortNumber(0.00000001, 3)).toEqual('0')
  expect(shortNumber(0.000000012, 3)).toEqual('0')
  expect(shortNumber(0.00000001, 9)).toEqual('0.00000001')
  expect(shortNumber(0.000000025, 9)).toEqual('0.00000002')
  expect(shortNumber(0.000000026, 9)).toEqual('0.00000003')
  expect(shortNumber(0.100000026, 3)).toEqual('0.1')
  expect(shortNumber('100.10', 3)).toEqual('100')
  expect(shortNumber('100.15', 4)).toEqual('100.2')
  expect(shortNumber('100.01', 4)).toEqual('100')
  expect(shortNumber('100.99', 4)).toEqual('101')
  expect(shortNumber('0.1000', 3)).toEqual('0.1')
  expect(shortNumber('0.0500', 3)).toEqual('0.05')
  expect(shortNumber('-100.10', 3)).toEqual('-100')
  expect(shortNumber('-100.15', 4)).toEqual('-100.2')
  expect(shortNumber('-100.01', 4)).toEqual('-100')
  expect(shortNumber('-100.99', 4)).toEqual('-101')
  expect(shortNumber('-0.1000', 3)).toEqual('-0.1')
  expect(shortNumber('-0.0500', 3)).toEqual('-0.05')
  expect(shortNumber(-1)).toEqual('-1')
  expect(shortNumber(-10)).toEqual('-10')
  expect(shortNumber(-100)).toEqual('-100')
  expect(shortNumber(-999)).toEqual('-999')
  expect(shortNumber(-1, 3)).toEqual('-1')
  expect(shortNumber(-12, 3)).toEqual('-12')
  expect(shortNumber(-123, 3)).toEqual('-123')
  expect(shortNumber(-1234, 3)).toEqual('-1.23k')
  expect(shortNumber(-12345, 3)).toEqual('-12.3k')
  expect(shortNumber(-123456, 3)).toEqual('-123k')
  expect(shortNumber(-1234567, 3)).toEqual('-1.23M')
  expect(shortNumber(-12345678, 3)).toEqual('-12.3M')
  expect(shortNumber(-123456789, 3)).toEqual('-123M')
  expect(shortNumber(-1234567890, 3)).toEqual('-1.23B')
  expect(shortNumber(-1235567890, 3)).toEqual('-1.24B')
  expect(shortNumber(-1100000000, 3)).toEqual('-1.1B')
  expect(shortNumber(-1000000000, 3)).toEqual('-1B')
  expect(shortNumber(-0.00000001, 3)).toEqual('-0')
  expect(shortNumber(-0.000000012, 3)).toEqual('-0')
  expect(shortNumber(-0.00000001, 9)).toEqual('-0.00000001')
  expect(shortNumber(-0.000000025, 9)).toEqual('-0.00000002')
  expect(shortNumber(-0.000000026, 9)).toEqual('-0.00000003')
  expect(shortNumber(-0.100000026, 3)).toEqual('-0.1')
})

it(`${isNumber.name}() returns true for number values only`, () => {
  NUMBER_VALUES.forEach(number => {
    expect(isNumber(number)).toBe(true)
  })
  NON_NUMBER_VALUES.forEach(value => {
    expect(isNumber(value)).toBe(false)
  })
})

it(`${isNumeric.name}() returns true for number-like values only`, () => {
  NUMERIC_VALUES.forEach(number => {
    expect(isNumeric(number)).toBe(true)
  })
  NON_NUMERIC_VALUES.forEach(value => {
    expect(isNumeric(value)).toBe(false)
  })
})

it(`${isContinuousNumberRanges.name}() returns true for incrementing list`, () => {
  expect(isContinuousNumberRanges([{from: 1, to: undefined}])).toBe(true)
  expect(isContinuousNumberRanges([{from: undefined, to: 2}])).toBe(true)
  expect(isContinuousNumberRanges([{from: 1, to: 2}])).toBe(true)
  expect(isContinuousNumberRanges([{from: 1, to: 2}, {from: 3, to: undefined}])).toBe(true)
  expect(isContinuousNumberRanges([{from: 1, to: 2}, {from: undefined, to: 4}])).toBe(true)
  expect(isContinuousNumberRanges([{from: 1, to: 2}, {from: 3, to: 4}])).toBe(true)
  expect(isContinuousNumberRanges([{from: -1, to: 2}, {from: 3, to: 4}])).toBe(true)
  expect(isContinuousNumberRanges([{from: undefined, to: 2}, {from: 3, to: 4}])).toBe(true)
  expect(isContinuousNumberRanges([{from: 1, to: undefined}, {from: 3, to: 4}])).toBe(true)
  expect(isContinuousNumberRanges([{from: 1, to: undefined}, {from: undefined, to: 4}])).toBe(true)
  expect(isContinuousNumberRanges([{from: 1, to: undefined}, {from: 3, to: undefined}])).toBe(true)
  expect(isContinuousNumberRanges([{from: 1, to: 1}, {from: 3, to: 4}])).toBe(false)
  expect(isContinuousNumberRanges([{from: 1, to: 2}, {from: 2, to: 4}])).toBe(false)
  expect(isContinuousNumberRanges([{from: 1, to: 2}, {from: 3, to: 2}])).toBe(false)
})

it(`${startEndFromNumberRanges.name}() returns correct starting and ending numbers`, () => {
  expect(startEndFromNumberRanges([{from: 1, to: 2}])).toEqual({start: 1, end: 2})
  expect(startEndFromNumberRanges([{from: -1, to: 2}, {from: 3, to: 4}])).toEqual({start: -1, end: 4})
  expect(startEndFromNumberRanges([{from: 1, to: 2}, {from: 3, to: undefined}])).toEqual({start: 1, end: 2})
  expect(startEndFromNumberRanges([{from: 1, to: undefined}, {from: 3, to: 4}])).toEqual({start: 1, end: 4})
  expect(startEndFromNumberRanges([{from: 1, to: null}, {from: null, to: 4}])).toEqual({start: 1, end: 4})
  expect(startEndFromNumberRanges([{from: 1, to: null}, {from: 3, to: 4}, {from: null, to: 5}]))
    .toEqual({start: 1, end: 5})

  // Incomplete cases
  expect(startEndFromNumberRanges([{from: 1, to: 2}, {from: 3, to: -4}]))
    .toEqual({start: 1, end: undefined})
})

it(`${decimalPlaces.name}() returns number of decimal places for numeric values`, () => {
  expect(decimalPlaces('1')).toBe(0)
  expect(decimalPlaces('1.000')).toBe(0)
  expect(decimalPlaces('0.000')).toBe(0)
  expect(decimalPlaces('0.000000001')).toBe(9)
  expect(decimalPlaces('0.0000000012')).toBe(10)
  expect(decimalPlaces('0.00000000120')).toBe(10)
  expect(decimalPlaces('0.0000000012012')).toBe(13)
  expect(decimalPlaces('.5')).toBe(1)
  expect(decimalPlaces('.05')).toBe(2)
  expect(decimalPlaces('0.001000')).toBe(3)
  expect(decimalPlaces('0.001')).toBe(3)
  expect(decimalPlaces('0.002')).toBe(3)
  expect(decimalPlaces('0.0023')).toBe(4)
  expect(decimalPlaces('25e-100')).toBe(100)
  expect(decimalPlaces('2.5e-99')).toBe(100)
  expect(decimalPlaces('.5e1')).toBe(0)
  expect(decimalPlaces('.25e1')).toBe(1)
  expect(decimalPlaces(1)).toBe(0)
  expect(decimalPlaces(1.000)).toBe(0)
  expect(decimalPlaces(0.000)).toBe(0)
  expect(decimalPlaces(0.000000001)).toBe(9)
  expect(decimalPlaces(0.0000000012)).toBe(10)
  expect(decimalPlaces(0.00000000120)).toBe(10)
  expect(decimalPlaces(0.0000000012012)).toBe(13)
  expect(decimalPlaces(.5)).toBe(1)
  expect(decimalPlaces(.05)).toBe(2)
  expect(decimalPlaces(0.001000)).toBe(3)
  expect(decimalPlaces(0.001)).toBe(3)
  expect(decimalPlaces(0.002)).toBe(3)
  expect(decimalPlaces(0.0023)).toBe(4)
  expect(decimalPlaces(25e-100)).toBe(100)
  expect(decimalPlaces(2.5e-99)).toBe(100)
  expect(decimalPlaces(.5e1)).toBe(0)
  expect(decimalPlaces(.25e1)).toBe(1)
  NON_NUMERIC_VALUES.forEach(value => {
    if (value === -Infinity) return
    expect(decimalPlaces(value)).toBe(0)
  })
})

it(`${greatestCommonDivisor.name}() returns the biggest divisible number between given numbers`, () => {
  expect(greatestCommonDivisor(0, 0)).toEqual(Infinity)
  expect(greatestCommonDivisor(0, 1)).toEqual(1)
  expect(greatestCommonDivisor(0, -1)).toEqual(1)
  expect(greatestCommonDivisor(1, 0)).toEqual(1)
  expect(greatestCommonDivisor(-1, 0)).toEqual(1)
  expect(greatestCommonDivisor(1, 2)).toEqual(1)
  expect(greatestCommonDivisor(1, -2)).toEqual(1)
  expect(greatestCommonDivisor(-1, 2)).toEqual(1)
  expect(greatestCommonDivisor(-1, -2)).toEqual(1)
  expect(greatestCommonDivisor(45, 54)).toEqual(9)
  expect(greatestCommonDivisor(24, 54)).toEqual(6)
  expect(greatestCommonDivisor(150, 100)).toEqual(50)
  expect(greatestCommonDivisor(75, 125)).toEqual(25)
  expect(greatestCommonDivisor(76, 323)).toEqual(19)
  expect(greatestCommonDivisor('0', '0')).toEqual(Infinity)
  expect(greatestCommonDivisor('0', '1')).toEqual(1)
  expect(greatestCommonDivisor('0', '-1')).toEqual(1)
})

it(`${roundTail.name}() rounds number to n* last digits`, () => {
  expect(roundTail(0, 3)).toEqual(0)
  expect(roundTail(0.001, 3)).toEqual(0)
  expect(roundTail(1234.001, 2)).toEqual(1200)
  expect(roundTail(279, 3)).toEqual(100)
  expect(roundTail(1234567, 3)).toEqual(1235000)
  expect(roundTail(1234567, 7)).toEqual(1000000)
  expect(roundTail(5234567, 7)).toEqual(10000000)
})

it(`${roundTo.name}() rounds number to the closet multiple of value`, () => {
  expect(roundTo(0, 3)).toEqual(0)
  expect(roundTo(0.001, 3)).toEqual(0)
  expect(roundTo(1234.001)).toEqual(1234)
  expect(roundTo(1234.001, 10)).toEqual(1230)
  expect(roundTo(1234.001, 5)).toEqual(1235)
})

it(`${roundDownTo.name}() rounds down number to the closet multiple of value`, () => {
  expect(roundDownTo(0, 3)).toEqual(0)
  expect(roundDownTo(0.001, 3)).toEqual(0)
  expect(roundDownTo(1234.001)).toEqual(1234)
  expect(roundDownTo(1234.001, 10)).toEqual(1230)
  expect(roundDownTo(1234.001, 5)).toEqual(1230)
})

it(`${roundUpTo.name}() rounds up number to the closet multiple of value`, () => {
  expect(roundUpTo(0, 3)).toEqual(0)
  expect(roundUpTo(0.001, 3)).toEqual(3)
  expect(roundUpTo(1234.001)).toEqual(1235)
  expect(roundUpTo(1234.001, 10)).toEqual(1240)
  expect(roundUpTo(1234.001, 5)).toEqual(1235)
})

it(`${toPercentage.name}() returns the difference percents between numbers correctly`, () => {
  expect(toPercentage(0, 0)).toEqual(0)
  expect(toPercentage(1, 0)).toEqual(Infinity)
  expect(toPercentage(-1, 0)).toEqual(-Infinity)
  expect(toPercentage(0, 1)).toEqual(-100)
  expect(toPercentage(1, 1)).toEqual(0)
  expect(toPercentage(2, 1)).toEqual(100)
  expect(toPercentage(1, 2)).toEqual(-50)
  expect(toPercentage(2, 1.5)).toEqual(33.33333333333333)
  expect(toPercentage(1, 1.5)).toEqual(-33.33333333333333)
  expect(toPercentage('1', '1')).toEqual(0)
  expect(toPercentage(1, '1')).toEqual(0)
  expect(toPercentage('1', 1)).toEqual(0)
  expect(toPercentage('not a number', 1.5)).toEqual(NaN)
  expect(toPercentage(1.5, 'not a number')).toEqual(NaN)
  expect(toPercentage({}, [])).toEqual(NaN)
})
