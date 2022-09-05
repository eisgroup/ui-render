import fs from 'fs'
import mkdirp from 'mkdirp'
import { resolvePath } from 'ui-modules-pack/variables'
import sanitizeName from 'sanitize-filename' // this package may have large dependency, so do not include it by default
import { _WORK_DIR_, warn } from 'ui-utils-pack'
import s3 from '../cdn/s3'

/**
 * FILE HELPERS ================================================================
 * =============================================================================
 */

/**
 * Promisified version of mkdirp lib
 * @see: https://www.npmjs.com/package/mkdirp for docs
 * @example:
 *    await makeDirectory(dir) // error will be thrown as rejection
 *
 * @param {String} dir - path to make
 * @param {Object|String} [options]
 * @returns {Promise<String|undefined>} promise that resolves to first directory `made` that had to be created,
 *    or undefined if everything already exists. Promise rejects if any errors are encountered.
 */
export function makeDirectory (dir, options) {
  return mkdirp(dir, options) // old `mkdirp` callback signature only worked in 0.5.1 in Linux
}

/**
 * Open and read File content
 *
 * @param {Object} filePath - see `resolvePath()` arguments
 * @param {String} [workDir] - working directory
 * @param {String|Object} [options] - read file options
 * @return {Promise<any>} content - from file
 */
export function read ({options = 'utf8', workDir = _WORK_DIR_, ...filePath}) {
  const {path} = resolvePath({workDir, ...filePath})
  return new Promise(function (resolve, reject) {
    fs.readFile(path, options, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * Save File to Local Server
 * @example: upload to Amazon S3 with file stream
 * https://stackoverflow.com/questions/60053008/typescript-sharp-js-transform-a-stream-into-multiple-sizes-and-upload-it-to-s3
 *
 * @param {Object} stream - of file buffer, the result of createReadStream(absoluteFilePath)
 * @param {Object} filePath - see `resolvePath()` arguments
 * @param {Object} [cdn] - S3 instance - if provided, will upload to s3 bucket
 * @param {String} [mimetype] - S3 ContentType
 * @param {Object} [read] - pipeline to use before `transform`
 * @param {Object} [transform] - pipeline to use before saving file (e.x. transform = sharp().resize(width, height))
 * @param {Object} [writeStream] - pipeline to use for saving file, uses fs.createWriteStream(path) by default
 * @returns {Promise<Object>} {path, name} - to file saved if successful, else error
 */
export async function saveFile ({stream, read, transform, writeStream, filePath, mimetype, cdn = s3}) {
  const {dir, path, name} = resolvePath(filePath)
  await makeDirectory(dir)

  return new Promise((resolve, reject) => {
    // file requires reassigning after each pipe
    let file = stream // if error during stream reading
      .on('error', error => {
        if (stream.truncated) fs.unlinkSync(path) // Delete the truncated file.
        reject(error)
      })
    if (read) file = file.pipe(read)
    if (transform) file = file.pipe(transform)
    file.pipe(writeStream || (cdn ? cdn.uploadStream({Key: path, ContentType: mimetype}) : fs.createWriteStream(path)))
      .on('error', error => reject(error))
      .on('finish', () => resolve({path, name}))
  })
}

/**
 * Remove File from Local Server
 * @param {Object} filePath - see `resolvePath()` arguments
 * @param {Object} [cdn] - S3 instance - if provided, will delete file from s3 bucket
 * @returns {Promise<Object|Error>} {path, removed} - to file removed if successful, else error object
 */
export function removeFile (filePath, cdn) {
  const {path} = resolvePath(filePath)
  return removeFilePromise(path, cdn)
}

/**
 * Create removeFile Promise
 * @param {String} path - full file path to remove
 * @param {Object} [cdn] - S3 instance - if provided, will delete file from s3 bucket
 * @returns {Promise<Object|Error>} {path, removed} - to file removed if successful, else error object
 */
export function removeFilePromise (path, cdn = s3) {
  return new Promise((resolve, reject) => {
    if (cdn) return cdn.remove({Key: path}).then(() => resolve({path, removed: true})).catch(reject)
    return fs.unlink(path, (err) => {
      if (err) return reject(err)
      return resolve({path, removed: true})
    })
  })
}

/**
 * Sanitize a string to be safe for use as a filename
 */
export function sanitize (filename) {
  return sanitizeName(filename)
}

/**
 * Convert File to base64 Encoded string for given file path
 *
 * @returns {String} base64 encoded or empty string, if file not found or error while encoding
 */
export function base64Encode (filePath) {
  // convert binary data to base64 encoded string
  try {
    return Buffer.from(fs.readFileSync(filePath)).toString('base64')
  } catch (err) {
    warn(err)
    return ''
  }
}
