import { round } from 'ui-utils-pack'

/**
 * NORMALIZERS =================================================================
 * Common normalizers to be used with redux-form
 * =============================================================================
 */

export const integer = (value) => value && parseInt(value, 10)
export const double5 = (value) => value && round(value, 5)
export const emptyStringToNull = (value) => ((value === '') ? null : value)
export const uppercase = (value) => value.toUpperCase()

export function number ({min = -Infinity, max = Infinity, decimals}) {
  return (value) => {
    if (value > max) return max
    if (Number(value) && value < min) return min
    return (decimals != null && value) ? round(value, decimals) : value
    // Disable pretty formatting because of cursor jump
    // let number = value.replace(/[^0-9.]/g, '')  // sanitize
    // if (!number) return ''
    // const decimals = String(number).split('.')[1]
    // return Math.floor(number).toLocaleString() + (decimals != null ? '.' + decimals : '')
  }
}

/**
 * Sanitize 'DD.MM.YYYY' time format
 */
export function date (value) {
  if (!value) return value

  // First, sanitize the input, replacing all non-numbers into a single dot, and trim the dots
  value = value.replace(/[^\d]+/gi, '.') // may end up with value like '.03.4.19.89.'
  const trailingDot = value[value.length - 1] === '.' ? '.' : ''
  value = value.replace(/(^\.)|(\.$)/gi, '') // may end up with value like '03.4.19.89'

  // Second, split the dots
  const list = value.split('.')
  if (!list[0]) return ''

  // User types in day
  let day = list[0].substring(0, 2)
  if (list.length < 2) return day + trailingDot

  // User began typing month
  let month = list[1].substring(0, 2)
  if (list.length < 3) return `${day}.${month}` + trailingDot

  // User began typing year
  let year = list[2].substring(0, 4)

  // Validate Day and Month when user completes typing
  if (year.length === 4) {
    // @note: do not add leading zeros to allow easy editing
    let mm = Number(month)
    if (mm > 12) {
      month = '12'
      mm = Number(month)
    }
    let maxDay = date.daysByMonth[mm]
    if (mm === 2 && !(Number(year) % 4)) maxDay += 1
    if (Number(day) > maxDay) day = maxDay
  }

  return `${day}.${month}.${year}`
}

date.daysByMonth = {
  0: 31,
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
}

/**
 * Sanitize 'HH:mm' time format
 */
export function hourMinute (value) {
  if (!value) return value

  // First, sanitize the input, replacing all non-numbers into a single colon, and trim the colons
  value = value.replace(/[^\d]+/gi, ':') // may end up with value like ':03:4:19:89:'
  const trailingDot = value[value.length - 1] === ':' ? ':' : ''
  value = value.replace(/(^\.)|(\.$)/gi, '') // may end up with value like '03:4:19:89'

  // Second, split the colons
  const list = value.split(':')
  if (!list[0]) return ''

  // User typed in hour
  let hour = list[0].substring(0, 2)
  if (list.length < 2) return hour + trailingDot

  // User began typing minute
  let minute = list[1].substring(0, 2)

  // Validate Hour and Minute when user completes typing
  if (minute.length === 2) {
    // @note: do not add leading zeros to allow easy editing
    if (Number(hour) > 23) hour = '23'
    if (Number(minute) > 59) minute = '59'
  }

  return `${hour}:${minute}`
}

export function phone (value) {
  if (!value) return value
  return value.replace(/[^\d\s-+()]+/gi, '')
    .replace(/^(.)?\+([^\d]+)?/g, '+')
    .replace(/([^\d\s]+)?\(([^\d]+)?/g, '(')
    .replace(/([^\d]+)?\)([^\d\s]+)?/g, ')')
    .replace(/([^\d]+)?-([^\d]+)?/g, '-')
    .replace(/\s\s+/g, ' ')
}
