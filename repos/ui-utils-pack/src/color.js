import { hasListValue, isList } from './array.js'
import { round } from './number.js'
import { isString } from './string.js'

/**
 * COLOR FUNCTIONS =============================================================
 * =============================================================================
 */

/**
 * Turn Gradient Color Scale into Divided Groups of Gradients with more Distinct Hues Between Adjacent Colors
 * @example:
 *    colorScaleDistinct(chroma.scale([GOLD_INVERSE, TEAL_INVERSE, VIOLET_INVERSE]).colors(keys.length), 3)
 *
 * @param {Array} colors - list of gradient color values to make distinct
 * @param {Number} hues - count of distinct colors used in the given gradient
 * @return {Array} colors - grouped in distinct gradients
 */
export function colorScaleDistinct (colors, hues) {
  // The number of color groups is also the distance between colors within new groups
  let groupCount = colors.length / hues
  if (groupCount < 2) return colors
  groupCount = Math.ceil(groupCount)  // round up to include extra colors from whole groups

  const result = []
  let lastIndex = 0
  let groupIndex = 0
  for (let i = 0; i < colors.length; i++) {
    if (groupIndex === hues) groupIndex = 0
    // Each Color within new group jumps the distance of group count
    if (groupIndex) {  // middle to end of the group
      lastIndex = Math.min(lastIndex + groupCount, colors.length - 1)
    } else {  // start of the group - use the first unused index from given colors
      lastIndex = Math.floor(i / hues)
    }
    result[i] = colors[lastIndex]
    groupIndex++
  }

  return result
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
