import moment from 'dayjs'
import humanizeDuration from 'humanize-duration'
import {
  FIFTEEN_MINUTES,
  FORMAT_DATE,
  FORMAT_DD_MMM,
  FORMAT_DD_MMM_YYYY,
  FORMAT_MMM_YYYY,
  FORMAT_TIME_FOR_HUMAN,
  ONE_HOUR,
  ONE_MINUTE,
  THIRTY_MINUTES
} from './constants.js'
import { isNumeric, startEndFromNumberRanges } from './number.js'

/**
 * TIME FUNCTIONS ==============================================================
 * =============================================================================
 */

/**
 * Convert Time Duration to User Friendly and Readable Format
 *
 * @param {Number} milliseconds - duration in milliseconds to convert
 * @param {Object} [options] - other humanize options, like `largest` to trim down units
 * @param {Boolean} [shorten] - whether to shorten words, like `seconds` to `s`
 * @returns {String} - formatted time
 */
export function formatDuration (milliseconds, { shorten = false, round = true, ...props } = {}) {
  props.round = round
  if (shorten) {
    return formatDuration.shortEnglish(milliseconds, props)
  }
  return humanizeDuration(milliseconds, props)
}

formatDuration.shortEnglish = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: function () { return 'y' },
      mo: function () { return 'mo' },
      w: function () { return 'w' },
      d: function () { return 'd' },
      h: function () { return 'h' },
      m: function () { return 'm' },
      s: function () { return 's' },
      ms: function () { return 'ms' }
    }
  },
  decimal: '.'
})

/**
 * Convert time to human readable date and time
 *
 * @param {String|Number|Date} time - date string, Unix timestamp, Date object, etc.
 * @param {String} [format] - to render date time as
 * @returns {String} - date time in given format
 */
export function formatTime (time, format = FORMAT_TIME_FOR_HUMAN) {
  return moment(time).format(format)
}

/**
 * Convert 24hr and minute format string (HH:mm) to Milliseconds
 *
 * @param {String} hourMinute - to convert
 * @returns {Number} milliseconds
 */
export function msFromHourMinute (hourMinute = '') {
  const time = hourMinute.split(':')
  if (!time[0] || !time[1]) return 0
  return (+time[0] * ONE_HOUR) + (+time[1] * ONE_MINUTE)
}

/**
 * Convert Number to String with leading zero/s at specified character length
 * @param {Number|String} number - to format
 * @param {Number} [length] - total character length of output, default is 2
 * @returns {String} time - string with leading zero/s if needed
 */
export function toLeadingZero (number, length = 2) {
  return ('0' + number).slice(-length)
}

/**
 * Convert time to full hour string
 *
 * @param {String|Number|Date} time - date string, Unix timestamp, Date object, etc.
 * @return {String} - hours and minutes
 */
export function toHours (time) {
  return formatTime(time, 'h a')
}

/**
 * Convert time to hour and minute string
 *
 * @param {String|Number|Date} time - date string, Unix timestamp, Date object, etc.
 * @return {String} - hours and minutes
 */
export function toHourMinutes (time) {
  return formatTime(time, 'h:mm A')
}

/**
 * Convert time to Day and Month string
 *
 * @param {String|Number|Date} time - date string, Unix timestamp, Date object, etc.
 * @return {String} - Day and Month
 */
export function toDate (time) {
  return formatTime(time, FORMAT_DD_MMM)
}

/**
 * Convert time to Day, Month and Year string
 *
 * @param {String|Number|Date} time - date string, Unix timestamp, Date object, etc.
 * @return {String} - Day Month, Year
 */
export function toDateYear (time) {
  return formatTime(time, FORMAT_DD_MMM_YYYY)
}

/**
 * Convert time toMonth and Year string
 *
 * @param {String|Number|Date} time - date string, Unix timestamp, Date object, etc.
 * @return {String} - Month and Year
 */
export function toMonthYear (time) {
  return formatTime(time, FORMAT_MMM_YYYY)
}

/**
 * Convert Start and End timestamp range to Human-friendly string
 *
 * @param {Number} start - timestamp
 * @param {Number} end - timestamp
 * @returns {String} date range - ex. `21 Sep - 17 Oct, 2019` or `13 - 21 Sep, 2019` or `13 Sep, 2019``
 */
export function toDateRange (start, end) {
  let from = formatTime(start, 'D MMM, YYYY')
  const to = formatTime(end, 'D MMM, YYYY')
  const fromDate = from.split(',')
  const toDate = to.split(',')
  if (from === to) {
    from = '' // same start and end date
  } else if (fromDate[1] === toDate[1]) {
    if (fromDate[0].split(' ')[1] === toDate[0].split(' ')[1]) // same month and year
      from = fromDate[0].split(' ')[0]
    else
      from = fromDate[0] // same year
  }
  return `${from ? from + ' - ' : ''}${to}`
}

/**
 * Convert Date String to Unix Timestamp
 * @param {String} dayMonthYear - DD.MM.YYYY
 * @returns {Number|Undefined} timestamp - if given date string is valid, else undefined
 */
export function timestampFromDate (dayMonthYear) {
  const d = (dayMonthYear || '').split('.')
  if (!d[0] || !d[1] || !d[2]) return
  return toTimestamp(new Date(+d[2], +d[1] - 1, +d[0]))
}

/**
 * Convert List of Dates with Hours and Minutes to list of Unix Timestamp Ranges
 *
 * @param {Array<{date: 'dd.mm.yyyy', from: 'hh:mm', to: 'hh:mm'}>} dates - list of dates with hours and minutes
 * @returns {Array<{from: Number, to: Number}>} times - list of Unix timestamp ranges
 */
export function toTimeRanges (dates) {
  return dates.map(toTimeRange)
}

/**
 * Convert Date with Hours and Minutes to Unix Timestamp Range
 *
 * @param {Object<{date: 'dd.mm.yyyy', from: 'hh:mm', to: 'hh:mm', ...}>} dateTime - strings
 * @returns {Object<{from: Number, to: Number, ...}>} time - Unix timestamp range
 */
export function toTimeRange ({date, from, to, ...result}) {
  const timeOfTheDay = timestampFromDate(date)
  if (!timeOfTheDay) return result
  if ((from || '').length === 5) result.from = timeOfTheDay + msFromHourMinute(from)
  if ((to || '').length === 5) result.to = timeOfTheDay + msFromHourMinute(to)
  return result
}

/**
 * Convert List of Unix Timestamp Ranges to list of Dates with Hours and Minutes
 * @param {Array<{from: Number, to: Number}>} times - list of Unix timestamp ranges
 * @returns {Array<{date: 'dd.mm.yyyy', from: 'hh:mm', to: 'hh:mm'}>} dates - list of dates with hours and minutes
 */
export function fromTimeRanges (times) {
  return times.map(({from, to}) => ({
    date: (from || to) ? formatTime(from || to, FORMAT_DATE) : '',
    from: from ? formatTime(from, 'HH:mm') : '',
    to: to ? formatTime(to, 'HH:mm') : '',
  }))
}

/**
 * Compute total milliseconds for given list of time ranges
 * @param {Array<{from: Number, to: Number}>} times - list of Unix timestamp ranges
 * @returns {Number} time - milliseconds
 */
export function totalFromTimeRanges (times) {
  let total = 0
  const {start, end} = startEndFromNumberRanges(times)
  if (start == null || end == null) return total
  total = end - start
  let breaks = 0
  let lastBreak = {}
  times.forEach(({from, to}) => {
    if (from < end && lastBreak.start != null) lastBreak.end = from
    if (to > start && !lastBreak.start) lastBreak.start = to
    if (lastBreak.start != null && lastBreak.end != null) {
      breaks += lastBreak.end - lastBreak.start
      lastBreak = {}
    }
  })
  return total - breaks
}

/**
 * Convert time to Unix timestamp in milliseconds
 *
 * @param {String|Number|Date} time - date string, Unix timestamp, Date object, etc.
 * @param {Number} [fallback] - timestamp to use in case conversion fails
 * @returns {Number} - timestamp in milliseconds
 */
export function toTimestamp (time, fallback) {
  // Timestamp number given as  string or number
  if (isNumeric(time)) {
    if (typeof time === 'string') time = Number(time)
    return time
  }

  return time ? moment(time).valueOf() : fallback
}

/**
 * Get a short string indicating time for given date in human-friendly way
 * @example:
 *    @return: 'Yesterday', '1 day ago', '2 weeks ago',
 * @param timestamp
 */
export function timeSince (timestamp) {
  return formatDuration(Date.now() - timestamp, { largest: 1 })
}

/* Time Utilities */
export class Time {
  /**
   * Get Milliseconds Until the Next Full Hour
   */
  static get tillNextHour () {
    const d = new Date()
    const minutes = d.getMinutes()
    const seconds = d.getSeconds()
    const milliseconds = d.getMilliseconds()
    return ONE_HOUR - (minutes * 60 + seconds) * 1000 - milliseconds
  }

  /**
   * Get Milliseconds Until the Next Full 30 Minutes
   */
  static get tillNext30Mins () {
    return Time.tillNextHour % THIRTY_MINUTES
  }

  /**
   * Get Milliseconds Until the Next Full 15 Minutes
   */
  static get tillNext15Mins () {
    return Time.tillNextHour % FIFTEEN_MINUTES
  }

  /**
   * Get Milliseconds Until the Next Full Duration Provided
   * (duration given must be less than ONE_HOUR)
   */
  static tillNext (duration) {
    return Time.tillNextHour % duration
  }
}
