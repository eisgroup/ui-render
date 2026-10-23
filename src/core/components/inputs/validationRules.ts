import { isEmpty, l, localiseTranslation } from '../../utils'
import { phraseMessage } from '../../utils/phrases'
import type { PhraseMessage } from '../../utils/phrases'
import { _ } from '../../utils/translations'
import { isGoodPassword } from '../../utils/utility'
import { isEmail as isEmailValue, isLengthMax, isURLWithProtocol } from '../../utils/validators'

// The message of `password.confirm`, registered beside its one reader. No meta can name that rule, so its message
// is not a built-in phrase a host translates. It lived in `engine/translations.ts` with the others until 2026-10-23,
// when they became built-in phrases.
localiseTranslation({
  PASSWORD_MISMATCH: {
    [l.ENGLISH]: 'Password mismatch',
  },
})

export const OK = undefined // Return type when validation passes

/**
 * A built-in phrase the field shows in its document's language, or OK. Each rule returns the same message each
 * time it fails (`PhraseMessage`).
 */
export type ValidationResult = PhraseMessage | undefined

const REQUIRED = phraseMessage('REQUIRED')
const INVALID_URL = phraseMessage('INVALID_URL')
const INVALID_EMAIL_ADDRESS = phraseMessage('INVALID_EMAIL_ADDRESS')
const PASSWORD_IS_TOO_WEAK = phraseMessage('PASSWORD_IS_TOO_WEAK')

export function isRequired (value: unknown): ValidationResult {
  return (value == null || value === '' || Number.isNaN(value) || (typeof value === 'object' && isEmpty(value))) ? REQUIRED : OK
}

export function url (value: unknown): ValidationResult {
  return (value && !isURLWithProtocol(String(value))) ? INVALID_URL : OK
}

export function email (value: unknown): unknown { // `unknown`: a falsy value is returned as it is
  return value && (isEmailValue(String(value)) ? OK : INVALID_EMAIL_ADDRESS)
}

export function maxLength (length = 100): (value: unknown) => ValidationResult {
  const tooLong = phraseMessage('MUST_BE_LESS_THAN_CHARACTERS', {count: length})
  return (value) => (
    isLengthMax(String(value), length)
      ? OK
      : tooLong
  )
}

type PasswordRule = typeof password & { value?: unknown } // a cast: `value` is assigned inside the function

export function password (value: unknown): ValidationResult {
  (password as PasswordRule).value = value
  return (!value || isGoodPassword(value as string)) ? OK : PASSWORD_IS_TOO_WEAK
}

// @Note: must be called after `password` validator, because it depends on value set by that function
password.confirm = (value: unknown): string | undefined => {
  return (value === (password as PasswordRule).value) ? OK : _.PASSWORD_MISMATCH
}
