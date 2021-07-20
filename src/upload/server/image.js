import fs from 'fs'
import { fileNameSized, resolvePath, VALIDATE } from 'modules-pack/variables'
import PromiseAll from 'promises-all'
import sharp from 'sharp'
import { assertBackend } from 'utils-pack'
import { widthScaled } from 'utils-pack/media'
import { makeDirectory } from './file'

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
 * Remove Image with different Sizes from Local Server
 * @param {Object} filePath - see `resolvePath()` for argument
 * @param {Object} sizes<res, width, height, fit> - resize() options by the file `size` name (i.e. thumb/medium/...)
 * @returns {Promise<Object>} {[path], [removed], errors} - to original image removed if successful, else error objects
 */
export function removeImgSizes ({filePath, sizes}) {
  const {dir, path, name} = resolvePath(filePath)
  const removals = []
  for (const size in sizes) {
    const path = `${dir}/${fileNameSized(name, size)}`
    removals.push(new Promise((resolve, reject) => fs.unlink(path, (err) => {
      if (err) return reject(err)
      return resolve({path, removed: true})
    })))
  }
  return PromiseAll.all(removals)
    .then(({resolve, reject: errors}) => {
      return resolve.length ? {path, removed: true, errors} : {errors}
    })
}

/**
 * Resizes an Image to Different Sizes from given File Stream and Saves them to Local Server
 * @param {Stream} stream - readable file stream from `createReadStream()` to create Images for
 * @param {Object} filePath - see `resolvePath()` for argument
 * @param {Object} sizes<res, width, height, fit> - resize() options by the file `size` name (i.e. thumb/medium/...)
 * @returns {Promise<Object>} {[path], [name], ...[metaData], errors} - to original image saved if successful, else error objects
 */
export async function saveImgSizes ({stream, filePath, sizes}) {
  const {dir, path, name} = resolvePath(filePath)
  const {error} = await makeDirectory(dir)
  if (error) return {errors: [error]}
  const uploads = []
  const pipeline = sharp()
  let metadata
  return stream.pipe(pipeline).metadata()
    .then((meta) => {
      metadata = meta
      for (const size in sizes) {
        uploads.push(
          pipeline
            .clone()
            .resize(...resizeArgs(sizes[size], meta))
            .toFormat(meta.format) // force format to sanitize the file
            .toFile(`${dir}/${fileNameSized(name, size)}`)
        )
      }
      return PromiseAll.all(uploads)
    })
    .then(({resolve, reject: errors}) => {
      return resolve.length ? {...metadata, path, name, errors} : {errors}
    })
}

/**
 * Convert IMAGE.SIZES values to sharp.resize() chain method
 */
function resizeArgs ({res, width, height, fit = 'inside'}, meta) {
  // Compute width/height based on `res` limit
  if (res) {
    width = widthScaled(res, meta.width, meta.height)
    height = null
  }
  return [width, height, {fit, withoutEnlargement: true}]
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
