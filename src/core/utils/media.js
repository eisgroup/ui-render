
/**
 * MEDIA FUNCTIONS =============================================================
 * =============================================================================
 */

/**
 * Compute width for given resolution limit from original width/height dimensions, retaining aspect ratio
 * @example:
 *  width: 10   height: 20   resolution: 200
 *      w: 5?        h: 10?        res: 50
 *  >>> w = sqrt(res/resolution) * width
 *        = sqrt(50/200)*10
 *        = 5
 *
 * @param {Number} res - resolution limit to compute width for
 * @param {Number} width - original dimension
 * @param {Number} height - original dimension
 * @returns {Number} width - for given `res`
 */
export function widthScaled (res, width, height) {
  return Math.round(Math.sqrt(res / width / height) * width)
}
