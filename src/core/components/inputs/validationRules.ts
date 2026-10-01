import { interpolateString, isEmpty, pluralize, toLowerCase } from '../../utils'
import { _ } from '../../utils/translations'
import { isGoodPassword } from '../../utils/utility'
import { isEmail as isEmailValue, isLengthMax, isURLWithProtocol } from '../../utils/validators'

export const OK = undefined // Return type when validation passes

export type ValidationResult = string | undefined // an error message, or OK

export function isRequired (value: unknown): ValidationResult {
  return (value == null || value === '' || Number.isNaN(value) || (typeof value === 'object' && isEmpty(value))) ? _.REQUIRED : OK
}

export function url (value: unknown): ValidationResult {
  return (value && !isURLWithProtocol(String(value))) ? _.INVALID_URL : OK
}

export function email (value: unknown): unknown { // `unknown`: a falsy value is returned as it is
  return value && (isEmailValue(String(value)) ? OK : _.INVALID_EMAIL_ADDRESS)
}

export function maxLength (length = 100): (value: unknown) => ValidationResult {
  return (value) => (
    isLengthMax(String(value), length)
      ? OK
      : interpolateString(_.MUST_BE_LESS_THEN_characters, {characters: pluralize(toLowerCase(_.CHARACTER), length, true)})
  )
}

type PasswordRule = typeof password & { value?: unknown } // a cast: `value` is assigned inside the function

export function password (value: unknown): ValidationResult {
  (password as PasswordRule).value = value
  return (!value || isGoodPassword(value as string)) ? OK : _.PASSWORD_IS_TOO_WEAK
}

// @Note: must be called after `password` validator, because it depends on value set by that function
password.confirm = (value: unknown): ValidationResult => {
  return (value === (password as PasswordRule).value) ? OK : _.PASSWORD_MISMATCH
}

