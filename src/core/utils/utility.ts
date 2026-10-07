import { Active } from './_envs'
import { isList } from './array'
import { isObject } from './object'

/**
 * AD HOC FUNCTIONS ============================================================
 * =============================================================================
 */

/**
 * Check if given value is truthy.
 * A value is considered to be falsy, if it's one of these:
 *    false, undefined, null, NaN, 0, 0.0, -0, +0, -0.0, +0.0, '', {}, [],
 *
 * @param val - to evaluate for truthiness
 */
export function isTruthy (val: unknown): boolean {
  if (!val) return false
  if (isList(val) && val.length === 0) return false
  return !(isObject(val) && Object.keys(val).length === 0)
}

/**
 * Check if given password is good enough
 * @see: https://lowe.github.io/tryzxcvbn/
 *    minimum score of 3 is for safe password in security sensitive applications, 2 is usually enough
 *
 * @param value - to check
 * @param strength - minimum strength
 * @returns true - if it is
 */
export function isGoodPassword (value: string, strength: number = 2): boolean {
  return passStrength(value) >= strength
}

/**
 * Check Password Strength
 *
 * Exported for its unit tests: no other module imports it.
 *
 * @See: https://github.com/dropbox/zxcvbn
 *
 * @param password - to check
 * @return strength - result score
 */
export function passStrength (password: string): number {
  // No checker configured skips the check, on the server as in the browser, whose getter falls back
  // to `() => ({score: Infinity})` until zxcvbn loads. On the server the getter returns `undefined`
  // until the host assigns one, and this called it anyway: every `validate: 'password'` threw
  // `TypeError: Active.passwordCheck is not a function` (`validationRules.server.test.js`).
  const check = Active.passwordCheck
  return check ? check(password).score : Infinity
}
