import chroma from 'chroma-js'
import { colorScaleDistinct } from './array'

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
