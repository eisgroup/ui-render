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

export function phone (value) {
  if (!value) return value
  return value.replace(/[^\d\s-+()]+/gi, '')
    .replace(/^(.)?\+([^\d]+)?/g, '+')
    .replace(/([^\d\s]+)?\(([^\d]+)?/g, '(')
    .replace(/([^\d]+)?\)([^\d\s]+)?/g, ')')
    .replace(/([^\d]+)?-([^\d]+)?/g, '-')
    .replace(/\s\s+/g, ' ')
}
