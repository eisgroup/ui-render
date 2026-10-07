import { round } from '../../utils'

export const integer = (value: unknown) => {
  if (value === '' || value == null) return value
  const n = parseInt(value as string, 10) // `parseInt` stringifies whatever it is given
  return Number.isNaN(n) ? value : n
}
export const double5 = (value: number | string) => value && round(value, 5) // a field's raw value, as `round` takes it
// Not a string, such as the `undefined` final-form formats for an empty field: as it is
export const uppercase = (value: unknown) => typeof value === 'string' ? value.toUpperCase() : value

export function phone (value: string) {
  if (!value) return value
  return value.replace(/[^\d\s-+()]+/gi, '')
    .replace(/^(.)?\+([^\d]+)?/g, '+')
    .replace(/([^\d\s]+)?\(([^\d]+)?/g, '(')
    .replace(/([^\d]+)?\)([^\d\s]+)?/g, ')')
    .replace(/([^\d]+)?-([^\d]+)?/g, '-')
    .replace(/\s\s+/g, ' ')
}
