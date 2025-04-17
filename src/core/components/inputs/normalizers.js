import { round } from 'ui-utils-pack'

export const integer = (value) => value && parseInt(value, 10)
export const double5 = (value) => value && round(value, 5)
export const emptyStringToNull = (value) => ((value === '') ? null : value)
export const uppercase = (value) => value.toUpperCase()

export function number ({min = -Infinity, max = Infinity, decimals}) {
  return (value) => {
    if (value > max) return max
    if (Number(value) && value < min) return min
    return (decimals != null && value) ? round(value, decimals) : value
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
