import { SevenBoom as Response } from 'graphql-apollo-errors'
import PromiseAll from 'promises-all'
import { by, get, toJSON, warn } from 'utils-pack'
import { removeFile, sanitize, saveFile } from './file'
import { resize } from './image'

/**
 * UPLOAD PROCESS HELPERS ======================================================
 * =============================================================================
 */

/**
 * Process Image File Upload
 *
 * @param {String|Number} i - identifier or index position of the file
 * @param {Boolean} remove - whether to remove file
 * @param {File} file - object
 * @param [props] - other file props
 * @param {Object} [options] - options to pass to `saveFile()`
 * @returns {Promise<i, path, name>|Object<i, removed>} - result from `saveFile()` or object with info of file removed
 */
export async function processImageUpload ({i, remove, file, ...props}, options) {
  const filename = `${i}.jpg`
  if (remove) {
    const {removed} = await removeFile({filename, ...options})
    return {i, removed, ...props}
  }
  const {createReadStream, filename: name, mimetype} = await file
  if (mimetype !== 'image/jpeg') throw Response.badRequest(`Invalid file type ${mimetype}`)
  const stream = createReadStream()
  const {path} = await saveFile({stream, filename, resize: resize(), ...options})
  return {i, path, name: sanitize(name), ...props}
}

/**
 * Process Image Files Upload/Removal for given Mongo Model instance
 *
 * @param {Object} instance - containing photos to be updated
 * @param {Array<FileInput>} files - payload from resolver
 * @param {String} [kind] - used as sub-folder and database key to store files within 'photos' field
 * @param {String} [field] - path to photos field as defined in given model instance
 * @param {Number} [count] - limit number of files allowed
 * @returns {Promise<Object>} photos - updated field for model instance to save
 */
export async function updateImages ({
  instance,
  files,
  kind = 'public',
  field = 'photos',
  count = 1
}) {
  instance.markModified(field) // needed to update nested arrays in Mongoose
  // noinspection JSDeprecatedSymbols
  const dir = `/${instance.constructor.modelName}/${instance.id}/photos`
  const folders = `${dir}/${kind}`
  const {resolve, reject} = await PromiseAll.all(files
    .filter(f => f.i < count)
    .map(file => processImageUpload(file, {folders}))
  )
  let photos = get(instance, field)

  // Error Handling
  // This should always resolve, because successful file uploads are already saved,
  // we need to update database for them.
  // For failed uploads, simply ignore.
  if (reject.length) {
    // To simplify UI, we will not throw error, because it may be
    // caused by uploading, then removing file too quickly,
    // which causes unlink error for non-existing file path
    warn(`❌ ${processImageUpload.name}() has error ${toJSON(reject)}`)
  }

  // Update/Create Photos
  if (resolve.length) {
    const updatedPhotoByIndex = {}
    const deletedPhotoByIndex = {}
    const created = Date.now()
    resolve.forEach(({i, path, removed, name}) => {
      if (path) updatedPhotoByIndex[i] = {i, name, created}
      if (removed) deletedPhotoByIndex[i] = true
    })
    if (!photos || !photos.dir) photos = {dir, data: {}}
    photos.data[kind] = (photos.data[kind] || []).filter(({i}) => !updatedPhotoByIndex[i] && !deletedPhotoByIndex[i])
      .concat(Object.values(updatedPhotoByIndex))
      .sort(by('i'))
  }

  // Return existing, or updated photos, if upload successful
  return photos
}
