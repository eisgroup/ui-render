import moment from 'moment'
import { FORMAT_TIME_FOR_HUMAN } from './constants.js'

/**
 * TIME FUNCTIONS ==============================================================
 * =============================================================================
 */

const UNITS = [
  { unit: 'y', long: ['year', 'years'], ms: 31557600000 },
  { unit: 'mo', long: ['month', 'months'], ms: 2629800000 },
  { unit: 'w', long: ['week', 'weeks'], ms: 604800000 },
  { unit: 'd', long: ['day', 'days'], ms: 86400000 },
  { unit: 'h', long: ['hour', 'hours'], ms: 3600000 },
  { unit: 'm', long: ['minute', 'minutes'], ms: 60000 },
  { unit: 's', long: ['second', 'seconds'], ms: 1000 },
  { unit: 'ms', long: ['millisecond', 'milliseconds'], ms: 1 },
]

/**
 * Convert Time Duration to User Friendly and Readable Format
 *
 * @param {Number} milliseconds - duration in milliseconds to convert
 * @param {Object} [options]
 * @param {Boolean} [options.shorten] - whether to use short unit forms (y/mo/w/d/h/m/s/ms)
 * @param {Boolean} [options.round=true] - whether to round the smallest unit
 * @param {Number} [options.largest] - render at most N largest non-zero units
 * @param {String} [options.delimiter=', '] - separator between units
 * @param {String} [options.spacer=' '] - separator between value and unit
 * @param {String} [options.decimal='.'] - decimal separator for fractional values
 * @returns {String} - formatted time
 */
export function formatDuration (milliseconds, {
  shorten = false,
  round = true,
  largest,
  delimiter = ', ',
  spacer = ' ',
  decimal = '.',
} = {}) {
  if (milliseconds === 0) return shorten ? `0${spacer}s` : `0${spacer}seconds`
  let remaining = Math.abs(milliseconds)
  const parts = []
  for (let i = 0; i < UNITS.length; i++) {
    const def = UNITS[i]
    const isLast = i === UNITS.length - 1
    let value = remaining / def.ms
    if (isLast || (largest != null && parts.length === largest - 1)) {
      value = round ? Math.round(value) : value
    } else {
      value = Math.floor(value)
    }
    if (value > 0) {
      remaining -= value * def.ms
      const valueStr = String(value).replace('.', decimal)
      const label = shorten ? def.unit : def.long[value === 1 ? 0 : 1]
      parts.push(`${valueStr}${spacer}${label}`)
      if (largest != null && parts.length === largest) break
    }
    if (remaining <= 0) break
  }
  if (!parts.length) return shorten ? `0${spacer}s` : `0${spacer}seconds`
  const sign = milliseconds < 0 ? '-' : ''
  return sign + parts.join(delimiter)
}

formatDuration.shortEnglish = function (milliseconds, options = {}) {
  return formatDuration(milliseconds, { ...options, shorten: true })
}

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
