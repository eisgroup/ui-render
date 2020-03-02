import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'
import isURL from 'validator/lib/isURL'
import { isEmpty, isNumeric, isPhoneNumber, pluralize, toList } from '../../common/utils'
import { isGoodPassword } from '../../common/utils/utility'
import { FIELD } from '../../common/variables'

/**
 * VALIDATION RULES ============================================================
 * Common validation rules to be used with redux-form
 * =============================================================================
 */

export const OK = undefined // Return type when validation passes

export function isRequired (value) {
  return (value == null || value === '' || Number.isNaN(value) || (typeof value === 'object' && isEmpty(value))) ? 'Required' : OK
}

export function url (value) {
  return (value && !isURL(String(value), {require_protocol: true})) ? 'Not a valid URL' : OK
}

export function email (value) {
  return value && (isEmail(String(value)) ? OK : 'Invalid email address')
}

export function maxLength (length = 100) {
  return (value) => (
    isLength(String(value), {max: length})
      ? OK
      : `Must be less than ${pluralize('character', length, true)}`
  )
}

export function password (value) {
  password.value = value
  return (!value || isGoodPassword(value)) ? OK : 'Password is too weak'
}

// @Note: must be called after `password` validator, because it depends on value set by that function
password.confirm = (value) => {
  return (value === password.value) ? OK : 'Password mismatch'
}

export function phoneNumber (value) {
  return (!value || isPhoneNumber(value)) ? OK : 'Enter phone number with country code'
}

export function dateMonthYear (value) {
  return /^([0-3])?[0-9]\.([0-1])?[0-9]\.\d+$/.test(value) ? OK : 'Invalid date'
}

export function timeInThePast (value) {
  if (!isNumeric(value)) return OK
  const now = Date.now()
  return value >= now ? 'Must be in the past' : OK
}

export function timeRangesInFuture (value) {
  if (isEmpty(value)) return OK
  const now = Date.now()
  return toList(value).find(({from, to}) => (from <= now || to <= now)) ? 'Must be in the future' : OK
}

// Validate that Time Ranges contain `from` and `to` time
export function timeRanges (value) {
  if (isEmpty(value)) return OK
  const values = toList(value)
  if (!values.find(({from}) => from != null)) return 'Must have start time'
  if (!values.find(({to}) => to != null)) return 'Must have end time'
  return OK
}

// Validation Definitions
FIELD.VALIDATE = {
  EMAIL: 'email',
  MAX_LENGTH: 'maxLength',
  PASSWORD: 'password',
  REQUIRED: 'required',
  URL: 'url',
}
FIELD.VALIDATION = {
  [FIELD.VALIDATE.EMAIL]: email,
  [FIELD.VALIDATE.MAX_LENGTH]: maxLength,
  [FIELD.VALIDATE.PASSWORD]: password,
  [FIELD.VALIDATE.REQUIRED]: isRequired,
  [FIELD.VALIDATE.URL]: url,
}
