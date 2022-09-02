import { interpolateString, isEmpty, isNumeric, isPhoneNumber, pluralize, toList, toLowerCase } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import { isGoodPassword } from 'ui-utils-pack/utility'
import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'
import isURL from 'validator/lib/isURL'
import * as t from './translations'

const sideEffects = {t}

/**
 * VALIDATION RULES ============================================================
 * Common validation rules to be used with redux-form
 * =============================================================================
 */


export const OK = undefined // Return type when validation passes

export function isRequired (value) {
  return (value == null || value === '' || Number.isNaN(value) || (typeof value === 'object' && isEmpty(value))) ? _.REQUIRED : OK
}

export function url (value) {
  return (value && !isURL(String(value), {require_protocol: true})) ? _.INVALID_URL : OK
}

export function email (value) {
  return value && (isEmail(String(value)) ? OK : _.INVALID_EMAIL_ADDRESS)
}

export function maxLength (length = 100) {
  return (value) => (
    isLength(String(value), {max: length})
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

export function phoneNumber (value) {
  return (!value || isPhoneNumber(value)) ? OK : _.ENTER_NUMBER_STARTING_WITH_plus_COUNTRY_CODE
}

export function dateMonthYear (value) {
  return /^([0-3])?[0-9]\.([0-1])?[0-9]\.\d+$/.test(value) ? OK : _.INVALID_DATE
}

export function timeInThePast (value) {
  if (!isNumeric(value)) return OK
  const now = Date.now()
  return value >= now ? _.MUST_BE_IN_THE_PAST : OK
}

export function timeRangesInFuture (value) {
  if (isEmpty(value)) return OK
  const now = Date.now()
  return toList(value).find(({from, to}) => (from <= now || to <= now)) ? _.MUST_BE_IN_THE_FUTURE : OK
}

// Validate that Time Ranges contain `from` and `to` time
export function timeRanges (value) {
  if (isEmpty(value)) return OK
  const values = toList(value)
  if (!values.find(({from}) => from != null)) return _.MUST_HAVE_START_TIME
  if (!values.find(({to}) => to != null)) return _.MUST_HAVE_END_TIME
  return OK
}
