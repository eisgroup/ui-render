import { interpolateString, isEmpty, pluralize, toLowerCase } from '../../utils'
import { _ } from '../../utils/translations'
import { isGoodPassword } from '../../utils/utility'
import { isEmail as isEmailValue, isLengthMax, isURLWithProtocol } from '../../utils/validators'

export const OK = undefined // Return type when validation passes

export function isRequired (value) {
  return (value == null || value === '' || Number.isNaN(value) || (typeof value === 'object' && isEmpty(value))) ? _.REQUIRED : OK
}

export function url (value) {
  return (value && !isURLWithProtocol(String(value))) ? _.INVALID_URL : OK
}

export function email (value) {
  return value && (isEmailValue(String(value)) ? OK : _.INVALID_EMAIL_ADDRESS)
}

export function maxLength (length = 100) {
  return (value) => (
    isLengthMax(String(value), length)
      ? OK
      : interpolateString(_.MUST_BE_LESS_THEN_characters, {characters: pluralize(toLowerCase(_.CHARACTER), length, true)})
  )
}

export function password (value) {
  password.value = value
  return (!value || isGoodPassword(value)) ? OK : _.PASSWORD_IS_TOO_WEAK
}

// @Note: must be called after `password` validator, because it depends on value set by that function
password.confirm = (value) => {
  return (value === password.value) ? OK : _.PASSWORD_MISMATCH
}

