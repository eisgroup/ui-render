import { VALIDATE } from 'modules-pack/variables'
import sharp from 'sharp'
import { assertBackend } from 'utils-pack'

/**
 * IMAGE HELPERS ===============================================================
 * =============================================================================
 */
assertBackend()

/**
 * Create Resize Stream Pipeline
 * @example:
 *    file.createReadStream().pipe(resize())
 *
 * @param {Number} width - maximum width
 * @param {Number} [height] - maximum height
 * @param {String} [fit] - sharp option
 * @param {String} [format] - sharp file extension in lowercase
 * @returns {Sharp} - transform pipeline
 */
export function resize ({width = VALIDATE.IMAGE_MAX_RES, height = null, fit = 'inside', format = 'jpeg'} = {}) {
  return sharp().resize(width, height, {fit, withoutEnlargement: true}).toFormat(format)
}

/**
 * Create Image Meta Data Read Stream Pipeline
 * @param {Object} metaData - object to fill with image meta data
 * @returns {*} imgMeta - read pipeline
 */
export function imgMeta (metaData) {
  const pipeline = sharp()
  pipeline.metadata()
    .then(info => {
      Object.assign(metaData, info)
    })
  return pipeline
}
