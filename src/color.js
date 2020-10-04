import chroma from 'chroma-js'
import { isString } from 'utils-pack/string'
import { colorScaleDistinct, hasListValue, isList } from './array'
import { round } from './number'

/**
 * COLOR FUNCTIONS =============================================================
 * =============================================================================
 */

const PINK = 'rgb(235, 77, 164)'
const TEAL = 'rgb(0, 172, 188)'
const VIOLET = 'rgb(90, 55, 187)'

/**
 * Generate User-friendly Evenly Distributed Colors with Distinct Adjacent Hues
 *
 * @param {Number} count - number of colors to generate
 * @param {Array} [colors] - list of rgb/a or hex colors to use
 * @param {Number} [hueCount] - number of distinct hues to use
 * @returns {Array} colors - list of colors
 */
export function gradientColors (count, colors = [PINK, TEAL, VIOLET], hueCount = 3) {
  return colorScaleDistinct(chroma.scale(colors).colors(count), hueCount)
}

/**
 * Convert given value to a standardized RGB(A) Color Array
 *
 * @param {Array|String} value - to check
 * @return {Array|Boolean} color - if it's a valid color value, else `false`
 */
export function toRgbaColor (value) {
  const color = hasListValue(value) ? value : String(value).split(',').map(val => Number(val.trim()))
  return isRgba(color) && color
}

/**
 * Check if given value is a valid Array of RGB(A) color numbers/strings
 *
 * @param {Array} color - to check
 * @returns {Boolean} true - if it's valid
 */
export function isRgba (color) {
  if (!isList(color)) return false
  if (color.length < 3 || color.length > 4) return false
  if (!(color[0] >= 0 && color[0] <= 255)) return false
  if (!(color[1] >= 0 && color[1] <= 255)) return false
  if (!(color[2] >= 0 && color[2] <= 255)) return false
  return !(color[3] && !(color[3] >= 0 && color[3] <= 1))
}

/**
 * Convert an RGB Color to Scaled Color3 Array
 * @note: in certain frameworks, like Babylon.js, Color3 is an array of RGB numbers ranging from 0 to 1.
 *
 * @param {Array<Number | String>} color - with RGB values ranging from 0 to 255
 * @param {Number} [precision] - decimal places to keep
 * @returns {Array<Number>} Color3 - with RGB values ranging from 0 to 1
 */
export function rgbToColor3 (color, precision = 6) {
  return color.map(number => round(number / 255, precision))
}

/**
 * Convert a Scaled Color3 Array to an RGB Color
 * @note: in certain frameworks, like Babylon.js, Color3 is an array of RGB numbers ranging from 0 to 1.
 *
 * @param {Array<Number>} color3 - with RGB values ranging from 0 to 1
 * @returns {Array<Number | String>} color - with RGB values ranging from 0 to 255
 */
export function rgbFromColor3 (color3) {
  return color3.map(number => Math.round(number * 255))
}

/**
 * Convert an RGB Color to Hex String
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @return {String} hex color
 */
export function rgbToHex ([r, g, b]) {
  if (isString(r)) throw new Error(`${rgbToHex.name}() requires an RGB color array of numbers`)
  return '#' + colorToHex(r) + colorToHex(g) + colorToHex(b)
}

/**
 * Convert Color code to Hex String
 * @param {Number} c - from 0 to 255
 * @return {String} hex code
 */
function colorToHex (c) {
  const hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

/**
 * Convert a Hex String to RGB Color if valid
 * @param {String} hex - string with or without `#` at the beginning
 * @return {Array<Number>|Null} RGB color array - if given valid hex string, else null
 */
export function rgbFromHex (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}
