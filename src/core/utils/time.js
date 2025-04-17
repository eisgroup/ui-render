import moment from 'dayjs'
import humanizeDuration from 'humanize-duration'
import { FORMAT_TIME_FOR_HUMAN } from './constants.js'

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
 * Convert time to full hour string
 *
 * @param {String|Number|Date} time - date string, Unix timestamp, Date object, etc.
 * @return {String} - hours and minutes
 */
export function toHours (time) {
  return formatTime(time, 'h a')
}
