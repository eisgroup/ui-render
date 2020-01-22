import chroma from 'chroma-js'
import { DEFAULT } from '../variables'
import { colorScaleDistinct } from './array'

/**
 * COLOR FUNCTIONS =============================================================
 * =============================================================================
 */

/**
 * Generate User-friendly Evenly Distributed Colors with Distinct Adjacent Hues
 *
 * @param {Number} count - number of colors to generate
 * @param {Array} [colors] - list of rgb/a or hex colors to use
 * @param {Number} [hueCount] - number of distinct hues to use
 * @returns {Array} colors - list of colors
 */
export function gradientColors (count, colors = DEFAULT.GRADIENT_COLORS, hueCount = DEFAULT.GRADIENT_HUE_COUNT) {
  return colorScaleDistinct(chroma.scale(colors).colors(count), hueCount)
}
