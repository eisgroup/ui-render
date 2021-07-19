import fs from 'fs'
import { resolvePath, VALIDATE } from 'modules-pack/variables'
import sharp from 'sharp'
import { assertBackend, fileExtensionNormalized, fileNameWithoutExt, warn } from 'utils-pack'
import { widthScaled } from 'utils-pack/media'

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
 * @param {String} [fit] - sharp option, see https://sharp.pixelplumbing.com/api-resize
 * @param {String} [format] - sharp file extension in lowercase
 * @returns {Sharp} - transform pipeline
 */
export function resize ({width = VALIDATE.IMAGE_MAX_RES, height = null, fit = 'inside', format = 'jpeg'} = {}) {
  return sharp().resize(width, height, {fit, withoutEnlargement: true}).toFormat(format)
}

/**
 * Create Resizes Stream Pipeline
 * @param {Object} filePath - see `resolvePath()` for argument
 * @param {Object} sizes<res, width, height, fit> - resize() options by the file `size` name (i.e. thumb/medium/...)
 * @returns {*} resizes - write stream pipeline
 */
export function resizes ({filePath, sizes}) {
  const pipeline = sharp()
  const {dir, name} = resolvePath(filePath)
  const filename = fileNameWithoutExt(name)
  const ext = fileExtensionNormalized(name)
  const extension = ext ? `.${ext}` : ''
  pipeline.metadata()
    .then((meta) => {
      for (const label in sizes) {
        const size = label ? `_${label}` : ''
        let {res, width, height, fit = 'inside'} = sizes[size]
        // Compute width/height based on `res` limit
        if (res) {
          width = widthScaled(res, meta.width, meta.height)
          height = null
        }
        pipeline
          .clone()
          .resize(width, height, {fit, withoutEnlargement: true})
          .toFormat(meta.format) // sanitizes the file
          .pipe(fs.createWriteStream(`${dir}/${filename}${size}${extension}`))
      }
      return pipeline
    })
    .catch(warn)
  return pipeline
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
