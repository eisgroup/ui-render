import { FIVE_HOURS, FORMAT_DATE, ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_YEAR } from '../constants'
import {
  formatDuration,
  formatTime,
  fromTimeRanges,
  msFromHourMinute,
  timestampFromDate,
  toDateRange,
  toLeadingZero,
  totalFromTimeRanges,
  toTimeRanges,
  toTimestamp
} from '../time'

const date = '11.11.1987'
const timestamp = timestampFromDate(date)

it(`${formatDuration.name}() renders durations correctly`, () => {
  expect(formatDuration(1234, {shorten: true, round: false, units: ['ms']})).toEqual('1234 ms')
  expect(formatDuration(1234, {shorten: false, round: false, units: ['ms']})).toEqual('1234 milliseconds')
})

it(`${formatTime.name}() renders date correctly`, () => {
  expect(formatTime(timestamp, FORMAT_DATE)).toEqual(date)
})

it(`${msFromHourMinute.name}() returns correct amount of milliseconds`, () => {
  expect(msFromHourMinute('1:01')).toEqual(ONE_HOUR + ONE_MINUTE)
  expect(msFromHourMinute('05:00')).toEqual(FIVE_HOURS)
  expect(msFromHourMinute('05:')).toEqual(0)
  expect(msFromHourMinute(':05')).toEqual(0)
  expect(msFromHourMinute('')).toEqual(0)
  expect(msFromHourMinute()).toEqual(0)
})

it(`${toDateRange.name}() formats date range correctly into string`, () => {
  let end = 1565299933577
  let start = end
  let endDate = formatTime(end, 'D MMM, YYYY')
  expect(toDateRange(start, end)).toEqual(endDate) // same start and end date
  start = end - ONE_YEAR
  expect(toDateRange(start, end)).toEqual(`${formatTime(start, 'D MMM, YYYY')} - ${endDate}`) // same date, different year
  start = end - ONE_MONTH
  expect(toDateRange(start, end)).toEqual(`${formatTime(start, 'D MMM')} - ${endDate}`) // same year
  start = end - ONE_DAY
  expect(toDateRange(start, end)).toEqual(`${formatTime(start, 'D')} - ${endDate}`) // same month and year
})

it(`${toTimestamp.name}() formats the time given correctly into Unix milliseconds`, () => {
  expect(toTimestamp('1513593809314')).toEqual(1513593809314)
  expect(toTimestamp('2017-12-15T10:11:51.781000Z')).toEqual(1513332711781)
  expect(toTimestamp('1987-11-11T00:00:00.000000Z')).toEqual(563587200000)
  expect(toTimestamp(null, 1001001001001)).toEqual(1001001001001)
  expect(toTimestamp(undefined, 1001001001001)).toEqual(1001001001001)
  expect(toTimestamp(NaN, 1001001001001)).toEqual(1001001001001)
})

describe(`TimeRange conversions`, () => {
  const now = new Date()
  const date = formatTime(now.getTime(), FORMAT_DATE)
  const timeOfTheDay = toTimestamp(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  const from = timeOfTheDay + ONE_HOUR + ONE_MINUTE
  const to = from + ONE_HOUR * 4
  const fromHourMinute = formatTime(from, 'HH:mm')
  const toHourMinute = formatTime(to, 'HH:mm')
  expect(date).toEqual(`${toLeadingZero(now.getDate(), 2)}.${toLeadingZero(now.getMonth() + 1, 2)}.${now.getFullYear()}`)
  expect(fromHourMinute).toEqual('01:01')
  expect(toHourMinute).toEqual('05:01')

  test(`${toTimeRanges.name}() converts date range string to timestamp ranges`, () => {
    expect(toTimeRanges([{date, from: fromHourMinute, to: toHourMinute}])).toEqual([{from, to}])
    expect(toTimeRanges([{date, from: fromHourMinute, to: undefined}])).toEqual([{from}])
    expect(toTimeRanges([{date, from: undefined, to: toHourMinute}])).toEqual([{to}])
    expect(toTimeRanges([{date, from: undefined, to: undefined}])).toEqual([{}])
    // @note: `from` and `to` times should only be calculated when explicitly given
    // so that User is able to type in time,
    // otherwise React state will force start time to `00:00` because of entered date.
  })

  test(`${fromTimeRanges.name}() converts timestamp ranges to date range strings`, () => {
    expect(fromTimeRanges([{from, to}])).toEqual([{date, from: fromHourMinute, to: toHourMinute}])
    expect(fromTimeRanges([{from, to: undefined}])).toEqual([{date, from: fromHourMinute, to: ''}])
    expect(fromTimeRanges([{from: undefined, to}])).toEqual([{date, from: '', to: toHourMinute}])
    expect(fromTimeRanges([{from: undefined, to: undefined}])).toEqual([{date: '', from: '', to: ''}])
    // @note: date ranges must always be string, else React will complain about uncontrolled input state changes
  })

  test(`${totalFromTimeRanges.name}() computes milisseconds correctly`, () => {
    expect(totalFromTimeRanges([])).toEqual(0)
    expect(totalFromTimeRanges([{from: 0, to: 1}])).toEqual(1)
    expect(totalFromTimeRanges([{from: 1, to: undefined}])).toEqual(0)
    expect(totalFromTimeRanges([{from: undefined, to: 1}])).toEqual(0)
    expect(totalFromTimeRanges([
      {from: 0, to: undefined},
      {from: undefined, to: 2},
    ])).toEqual(2)
    expect(totalFromTimeRanges([
      {from: 0, to: undefined},
      {from: 1, to: 2},
    ])).toEqual(2)
    expect(totalFromTimeRanges([
      {from: 0, to: 1},
      {from: undefined, to: 2},
    ])).toEqual(2)
    expect(totalFromTimeRanges([
      {from: 0, to: undefined},
      {from: 1, to: 2},
      {from: undefined, to: 3},
    ])).toEqual(3)
    expect(totalFromTimeRanges([
      {from: undefined, to: -1}, // shall exclude dangling end time
      {from: 0, to: undefined},
      {from: 1, to: 2},
      {from: undefined, to: 3},
      {from: 4, to: undefined}, // shall exclude dangling start time
    ])).toEqual(3)
  })
})

