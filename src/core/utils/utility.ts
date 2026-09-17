import { Active } from './_envs'
import { isInList, isList } from './array'
import { rad } from './number'
import { isObject } from './object'
import { isString, padStringLeft, randomString } from './string'

/**
 * AD HOC FUNCTIONS ============================================================
 * =============================================================================
 */

/** Options accepted by the `Id()` generator (all optional, see `Id` for defaults) */
export interface IdOptions {
  timestamp?: number
  caseSensitive?: boolean
  alphabet?: string
  padCount?: number
  suffix?: string
}

/**
 * Create Case-Sensitive Short Auto Incrementing ID string derived from Timestamp in milliseconds
 * @Important:
 *  - modifying this function may break existing database implementations.
 *  - directory/file names in Linux are case-sensitive, but are not in macOS or Windows;
 *    => it is better to only use lower case characters for this reason.
 * @Rationale: the primary use case is for generating globally unique Ids from frontend that can be used in backend.
 *
 * @Note:
 *    - The ID is 10 characters long:
 *        1. URL safe - case-insensitive alphanumeric only characters (36 radix)
 *        2. Safe for use as HTML5 id attribute
 *        2. Sorts chronologically without conversion (replacing the need for database timestamp)
 *           => Sorting will stop working after April 22, the year 5,188, because 36^9 limit padding is reached
 *              -> The solution is to increment the padCount to 10, which will work until January 18, the year 117,829.
 *
 *    - first 9 characters is Hex string of Timestamp
 *    - Last 3 character is randomized using alphanumeric characters to avoid collision
 *    - Collision probability is near zero in practice, because 3 random string suffix
 *        a. using 36 (case-insensitive) characters have 36^3 = 46,656 possibilities,
 *        b. using 62 (case-sensitive) characters have 62^3 = 238,328 possibilities,
 *        => it is unlikely two people would create more than that possibilities in the same millisecond.
 *    - Collision from the same user is prevented by checking for suffix duplicates within each millisecond.
 *    - This function is purposely slow with de-optimization to prevent generating too many Ids within one millisecond.
 *
 * @param [timestamp] - custom timestamp to generate ID for, defaults to Date.now()
 * @param [alphabet] - custom characters to use for Id generation, default to alphaNumeric characters
 * @param [caseSensitive] - whether to use case-sensitive characters
 * @param [padCount] - if generated ID length is less than this, it's padded with the first character in the `alphabet`
 * @param [suffix] - string to append to ID timestamp, default is random alphanumeric 3 characters string
 * @return ID - example: 'MJ8FU-RVRo'
 */
export function Id ({
  timestamp = Date.now(),
  caseSensitive = false,
  alphabet = caseSensitive ? Id.alphabet : Id.alphabetLower,
  padCount = caseSensitive ? 7 : 9,
  suffix = randomString(3, 3, {alphaNum: true}),
}: IdOptions = {}): string {
  if (!caseSensitive) suffix = suffix.toLowerCase()

  // Ensure unique suffix for each millisecond
  const history = Id.history[timestamp]
  if (history) {
    while (isInList(history, suffix)) {
      suffix = randomString(3, 3, {alphaNum: true})
      if (!caseSensitive) suffix = suffix.toLowerCase()
    }
    history.push(suffix)
  } else {
    Id.history[timestamp] = [suffix]
  }

  // Garbage clean Id history
  for (const time in Id.history) {
    // @Note: `time` is a string key compared against a number, exactly as in the original JS
    if ((time as unknown as number) < timestamp) delete Id.history[time]
  }

  // Create hashed Id from Timestamp
  const charsCount = alphabet.length
  const timeChars: string[] = []
  let remainder = 0
  while (timestamp >= charsCount) {
    remainder = timestamp % charsCount // can be zero
    timestamp = Math.floor(timestamp / charsCount)
    timeChars.unshift(alphabet[remainder])
  }
  timeChars.unshift(alphabet[timestamp])
  const time = timeChars.join('')
  return padStringLeft(time, Array<string>(padCount).fill(alphabet[0]).join('')) + suffix
}

// !Important: changing values below may break existing database implementations
Id.alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' as string
Id.alphabetLower = '0123456789abcdefghijklmnopqrstuvwxyz' as string
Id.minLength = 10 as number // minimum case-sensitive ID length, including suffix
Id.pattern = new RegExp(`^[${Id.alphabet}]+$`)
Id.history = {} as Record<string, string[]> // log of previously generated Ids by timestamp

/**
 * Check if given string is a valid Short Auto Incrementing ID derived from Timestamp in milliseconds
 * @param value - to check
 * @return true - if valid, else false
 */
export function isId (value: unknown): boolean {
  return isString(value) && value.length >= Id.minLength && Id.pattern.test(value)
}

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
 * Get Timestamp in Milliseconds from Id string
 * @param string - Id generated by the Id() function
 * @return Timestamp - in Milliseconds, or throws error of Id is invalid
 */
export function timestampFromId (string: string): number {
  const alphabet = Id.alphabet
  const radix = alphabet.length
  const id = string.replace(timestampFromId.padPattern, '') // remove time padding
  const [...chars] = id.substring(0, id.length - 3) // trim out random strings
  let result = 0
  chars.reverse()
  for (const index in chars) {
    const char = chars[+index]
    const multiple = alphabet.indexOf(char)
    if (multiple === -1) throw new Error(`${timestampFromId.name}() found invalid Id character '${char}'`)
    result += multiple * Math.pow(radix, +index)
  }
  return result
}

timestampFromId.padPattern = new RegExp(`^(${Id.alphabet[0]})+`)

/** Geometry Point with latitude and longitude */
export interface GeoPoint {
  lat: number
  lng: number
}

/** Unit of measurement accepted by `distanceBetween()` */
export type DistanceUnit = 'km' | 'm' | 'mm'

/**
 * Calculate Distance between two Geometry Points (with latitude and longitude)
 *
 * @note: this method is fast, but inaccurate (using Haversine formula);
 *  for precise calculation - use https://www.npmjs.com/package/geolib
 *
 * @param point1
 * @param point2
 * @param [unit] - of measurements, default is millimeter (length unit saved in database)
 * @returns distance - between given points in chosen unit
 */
export function distanceBetween (point1: GeoPoint, point2: GeoPoint, unit: DistanceUnit = 'mm'): number {
  const dLat = rad(point2.lat - point1.lat)
  const dLong = rad(point2.lng - point1.lng)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(point1.lat)) * Math.cos(rad(point2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2)
  let distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 6378137 // Earth’s mean radius in meter
  switch (unit) {
    case 'mm':
      return distance * 1000
    case 'km':
      return distance / 1000
    case 'm':
    default:
      return distance // in metre
  }
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
 * Create standardized constant for namespacing modules
 * @param constant - to be used as unique module name
 * @param service - usually from ENV.SERVICE (example: "WEB", "SERVER", "API")
 * @returns namespace - prefixed with service name (example: "~WEB USER_LOGIN")
 */
export function namespace (constant: string, service: string): string {
  return `~${service} ${constant}`
}

/**
 * Check Password Strength
 *
 * @See: https://github.com/dropbox/zxcvbn
 *
 * @param password - to check
 * @return strength - result score
 */
export function passStrength (password: string): number {
  // @Note: `passwordCheck` is typed as possibly undefined; the original JS called it unconditionally,
  //    so the non-null assertion preserves the existing throw-on-missing behaviour.
  return Active.passwordCheck!(password).score
}
