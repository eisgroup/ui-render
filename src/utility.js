import { ACTIVE, ENV } from './_envs'
import { fromJSON } from './codec'
import { rad } from './number'

/**
 * AD HOC FUNCTIONS ============================================================
 * =============================================================================
 */

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
 * Check Password Strength
 *
 * @See: https://github.com/dropbox/zxcvbn
 *
 * @param {String} password - to check
 * @return {Object} strength - result
 */
export function passStrength (password) {
  return ACTIVE.passwordCheck(password).score
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

export function createScript (src, callback) {
  const d = document, t = 'script',
    o = d.createElement(t),
    s = d.getElementsByTagName(t)[0]
  o.src = src
  o.async = true
  if (callback) { o.addEventListener('load', callback, false) }
  s.parentNode.insertBefore(o, s)
}
