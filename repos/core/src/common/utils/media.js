import { greatestCommonDivisor } from './number'

/**
 * MEDIA FUNCTIONS =============================================================
 * =============================================================================
 */

/**
 * Get Aspect Ratio from given width and height
 *
 * @param {Number|String} width - dimension
 * @param {Number|String} height - dimension
 * @returns {String} aspect ratio - example '4:3'
 */
export function aspectRatio (width, height) {
  const divisor = greatestCommonDivisor(width, height)
  return `${width / divisor}:${height / divisor}`
}

/**
 * Get Aspect Ratio if Given Width and Height are in the List of Supported Aspect Ratios
 *
 * @param {Array<String>} supportedAspectRatios - example ['4:3','16:9']
 * @param {Number|String} width - dimension to check
 * @param {Number|String} height - dimension to check
 * @returns {String|Undefined} aspect ratio - or undefined, if not supported
 */
export function aspectRatioAllowed (supportedAspectRatios, width, height) {
  // Create lowest common divisor aspect ratios
  // this converts 21:9 to 7:3 for the calc aspect to work correctly
  const ratio = aspectRatio(width, height)
  return supportedAspectRatios
    .map(ratio => aspectRatio(...ratio.split(':')))
    .includes(ratio) ? ratio : undefined
}
