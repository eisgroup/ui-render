import fs from 'fs'
import mkdirp from 'mkdirp'
import { UPLOAD } from 'modules-pack/variables'
import sanitizeName from 'sanitize-filename'
import { _WORK_DIR_, warn } from 'utils-pack'

/**
 * FILE HELPERS ================================================================
 * =============================================================================
 */

/**
 * Promisified version of mkdirp lib
 * @see: https://www.npmjs.com/package/mkdirp for docs
 *
 * @param {String} dir - path to make
 * @param {Object|String} [options]
 * @returns {Promise<{made, error}>}
 */
export function makeDirectory (dir, options) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, options, (error, made) => error === null ? resolve({made}) : reject({error}))
  })
}

/**
 * Open and read File content
 *
 * @param {String} filename - path to file relative to 'workingDirectory'
 * @param {String} [workingDirectory] - path used to open file
 * @param {String|Object} [options] - read file options
 * @return {Promise<any>} content - from file
 */
export function read (filename, workingDirectory = _WORK_DIR_, options = 'utf8') {
  return new Promise(function (resolve, reject) {
    fs.readFile(workingDirectory + '/' + filename, options, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * Save Uploaded File to Local Folder
 *
 * @param {Object} stream - of file buffer
 * @param {String} filename - example: photo.jpg
 * @param {String} [folders] - sub folders path relative to UPLOAD_DIR to save to, if `dir` not given (e.x. '/userId')
 * @param {String} [dir] - full directory path, excluding file name, to use (e.x. `/data/uploads`)
 * @param {Object} [resize] - transform pipeline to use before saving file (e.x. resize = sharp().resize(width, height))
 * @returns {Promise<path>} path - to file saved if successful
 */
export async function saveFile ({stream, filename, folders = '', dir = null, resize = null}) {
  if (!dir) dir = UPLOAD.PATH + folders
  const {error} = await makeDirectory(dir)
  if (error) throw new Error(error)
  const path = dir + '/' + filename

  return new Promise((resolve, reject) => {
      let file = stream
        .on('error', error => {
          if (stream.truncated) fs.unlinkSync(path) // Delete the truncated file.
          reject(error)
        })
      if (resize) file = file.pipe(resize)
      return file.pipe(fs.createWriteStream(path))
        .on('error', error => reject(error))
        .on('finish', () => resolve({path}))
    }
  )
}

/**
 * Remove Uploaded File by its name and folder path (or absolute path)
 *
 * @param {String} filename - example: photo.jpg
 * @param {String} [folders] - sub folders path relative to UPLOAD_DIR to save to, if `dir` not given (e.x. '/userId')
 * @param {String} [dir] - full directory path, excluding file name, to use (e.x. `/data/uploads`)
 * @param {String} [path] - full directory path, including file name, to use (e.x. `/data/uploads`)
 * @returns {Promise<path, removed>} path - to file removed if successful, else error object
 */
export function removeFile ({filename, folders = '', dir = null, path = null}) {
  if (!path) path = (dir || (UPLOAD.PATH + folders)) + '/' + filename
  return new Promise((resolve, reject) => fs.unlink(path, (err) => {
    if (err) return reject(err)
    return resolve({path, removed: true})
  }))
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
