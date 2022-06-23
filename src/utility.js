import { Active, ENV } from './_envs.js'
import { isInList, isList } from './array.js'
import { fromJSON } from './codec.js'
import { rad } from './number.js'
import { isObject } from './object.js'
import { isString, padStringLeft, randomString } from './string.js'

/**
 * AD HOC FUNCTIONS ============================================================
 * =============================================================================
 */

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
 * @param {Number|String} [timestamp] - custom timestamp to generate ID for, defaults to Date.now()
 * @param {String} [alphabet] - custom characters to use for Id generation, default to alphaNumeric characters
 * @param {Boolean} [caseSensitive] - whether to use case-sensitive characters
 * @param {Number} [padCount] - if generated ID length is less than this, it's padded with the first character in the `alphabet`
 * @param {String} [suffix] - string to append to ID timestamp, default is random alphanumeric 3 characters string
 * @return {String} ID - example: 'MJ8FU-RVRo'
 */
export function Id ({
  timestamp = Date.now(),
  caseSensitive = false,
  alphabet = caseSensitive ? Id.alphabet : Id.alphabetLower,
  padCount = caseSensitive ? 7 : 9,
  suffix = randomString(3, 3, {alphaNum: true}),
} = {}) {
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
    if (time < timestamp) delete Id.history[time]
  }

  // Create hashed Id from Timestamp
  const charsCount = alphabet.length
  let time = []
  let remainder = 0
  while (timestamp >= charsCount) {
    remainder = timestamp % charsCount // can be zero
    timestamp = Math.floor(timestamp / charsCount)
    time.unshift(alphabet[remainder])
  }
  time.unshift(alphabet[timestamp])
  time = time.join('')
  return padStringLeft(time, Array(padCount).fill(alphabet[0]).join('')) + suffix
}

// !Important: changing values below may break existing database implementations
Id.alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
Id.alphabetLower = '0123456789abcdefghijklmnopqrstuvwxyz'
Id.minLength = 10 // minimum case-sensitive ID length, including suffix
Id.pattern = new RegExp(`^[${Id.alphabet}]+$`)
Id.history = {} // log of previously generated Ids by timestamp

/**
 * Check if given string is a valid Short Auto Incrementing ID derived from Timestamp in milliseconds
 * @param {*} value - to check
 * @return {Boolean} true - if valid, else false
 */
export function isId (value) {
  return isString(value) && value.length >= Id.minLength && Id.pattern.test(value)
}

/**
 * Check if given value is truthy.
 * A value is considered to be falsy, if it's one of these:
 *    false, undefined, null, NaN, 0, 0.0, -0, +0, -0.0, +0.0, '', {}, [],
 *
 * @param {*} val - to evaluate for truthiness
 * @returns {boolean}
 */
export function isTruthy (val) {
  if (!val) return false
  if (isList(val) && val.length === 0) return false
  return !(isObject(val) && Object.keys(val).length === 0)
}

/**
 * Get Timestamp in Milliseconds from Id string
 * @param {String} string - Id generated by the Id() function
 * @return {Number|Error} Timestamp - in Milliseconds, or throws error of Id is invalid
 */
export function timestampFromId (string) {
  const alphabet = Id.alphabet
  const radix = alphabet.length
  const id = string.replace(timestampFromId.padPattern, '') // remove time padding
  const [...chars] = id.substring(0, id.length - 3) // trim out random strings
  let result = 0
  chars.reverse()
  for (const index in chars) {
    const multiple = alphabet.indexOf(chars[index])
    if (multiple === -1) throw new Error(`${timestampFromId.name}() found invalid Id character '${chars[index]}'`)
    result += multiple * Math.pow(radix, +index)
  }
  return result
}

timestampFromId.padPattern = new RegExp(`^(${Id.alphabet[0]})+`)

/**
 * Calculate Distance between two Geometry Points (with latitude and longitude)
 *
 * @note: this method is fast, but inaccurate (using Haversine formula);
 *  for precise calculation - use https://www.npmjs.com/package/geolib
 *
 * @param {Object<lat, lng>} point1
 * @param {Object<lat, lng>} point2
 * @param {String<'km'|'m'|'mm'>} [unit] - of measurements, default is millimeter (length unit saved in database)
 * @returns {Number} distance - between given points in chosen unit
 */
export function distanceBetween (point1, point2, unit = 'mm') {
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
 * @param {String} value - to check
 * @param {Number} strength - minimum strength
 * @returns {Boolean} true - if it is
 */
export function isGoodPassword (value, strength = 2) {
  return passStrength(value) >= strength
}

/**
 * Asynchronously load script with callback function once loaded
 * @note: only works if called before runtime!
 * @example:
 *  asyncLoad('/static/js/file.js', () => {})
 *
 * @param {String} src - file path
 * @param {Function} [callback]
 */
export function asyncLoad (src, callback) {
  const load = () => createScript(src, callback)
  if (window.attachEvent != null) {
    window.attachEvent('onload', load)
  } else {
    window.addEventListener('load', load, false)
  }
}

/**
 * Create HTML Element and insert it to DOM, before similar element type found in existing DOM
 * @param {String} type - HTML element kind (i.e. 'script', 'link', etc.)
 * @param {Object} props - element attributes
 * @returns {Promise<element, event>|void} promise - resolves when element loaded, with arguments of `addEventListener`
 */
function createElement ({type = 'script', ...props}) {
  if (typeof document === 'undefined') return
  const element = document.createElement(type)
  const sameType = document.getElementsByTagName(type)[0]
  for (const attribute in props) {
    element.attribute = props[attribute]
  }
  const result = new Promise((resolve) => {
    element.addEventListener('load', resolve, false)
  })
  sameType.parentNode.insertBefore(element, sameType)
  return result
}

/**
 * Create HTML DOM <script/>
 * @param {String} src
 * @param {Function} callback - to fire on script loaded
 */
export function createScript (src, callback) {
  if (typeof document === 'undefined') return
  const d = document, t = 'script',
    o = d.createElement(t),
    s = d.getElementsByTagName(t)[0]
  o.src = src
  o.async = true
  if (callback) { o.addEventListener('load', callback, false) }
  s.parentNode.insertBefore(o, s)
}

/**
 * Create standardized constant for namespacing modules
 * @param {String} constant - to be used as unique module name
 * @param {String} service - usually from ENV.SERVICE (example: "WEB", "SERVER", "API")
 * @returns {String} namespace - prefixed with service name (example: "~WEB USER_LOGIN")
 */
export function namespace (constant, service) {
  return `~${service} ${constant}`
}

/**
 * Check Password Strength
 *
 * @See: https://github.com/dropbox/zxcvbn
 *
 * @param {String} password - to check
 * @return {Object} strength - result
 */
export function passStrength (password) {
  return Active.passwordCheck(password).score
}

/**
 * Check that given .env variables are defined, and parse them to objects if necessary
 *
 * @param {Object} variables - key/value pairs of variable names and their descriptions
 * @return {Object} variables - has map of variables with their .env values, or throws error if variables are missing
 */
export function requireEnv (variables) {
  const result = {}
  Object.keys(variables).forEach(variable => {
    if (!ENV[variable])
      throw new Error(`Please enter ${variable} in .env in the root directory, as ${variables[variable]}`)
    result[variable] = fromJSON(ENV[variable].replace(/'/g, '"'))
  })
  return result
}

/**
 * Add Event Listener
 *
 * @param {String} event - name (i.e. 'keydown', 'keyup', etc.)
 * @param {Function} callback - event handler to add, receives `event` as argument
 */
export function subscribeTo (event, callback) {
  if (typeof document === 'undefined') return
  document.addEventListener(event, callback)
}

/**
 * Remove Event Listener
 *
 * @param {String} event - name (i.e. 'keydown', 'keyup', etc.)
 * @param {Function} callback - event handler to remove
 */
export function unsubscribeFrom (event, callback) {
  if (typeof document === 'undefined') return
  document.removeEventListener(event, callback)
}
