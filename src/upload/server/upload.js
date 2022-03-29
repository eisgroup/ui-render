// noinspection JSUnresolvedFunction

import { SevenBoom as Response } from 'graphql-apollo-errors'
import { fileId, fileName, folderFrom, IMAGE } from 'modules-pack/variables'
import mongoose from 'mongoose'
import PromiseAll from 'promises-all'
import {
  deleteProp,
  fileFormatNormalized,
  get,
  interpolateString,
  l,
  localiseTranslation,
  set,
  shortNumber,
  SIZE_KB,
  SIZE_MB_10,
  toFlatList,
  toJSON,
  toList,
  warn
} from 'utils-pack'
import { _ } from 'utils-pack/translations'
import { removeFile, sanitize, saveFile } from './file'
import { removeImgSizes, saveImgSizes } from './image'

/**
 * UPLOAD PROCESS HELPERS ======================================================
 * =============================================================================
 */

/**
 * Decorator to handle File Uploads for GraphQL Resolvers
 * @requirement:
 *    - the resolver must return a Mongoose model instance
 *    - this decorator should be the last because it calls .save()
 *
 * This uses a flexible structured file name system by design, which allows both
 * unstructured index based files, as well as ID or custom folder based uploads.
 * The structure comes from `FileInput` fields: `kind`, `i`, `id` and `name` (computed by the server).
 * If above fields are omitted, the server falls back to entry ID for file name.
 *
 * @example:
 *   *@filesUploaded({fields: 'files', mimetypes: IMAGE.MIME_TYPES}) // defaults
 *    user (parent, args, context, info) {
 *      // ...resolver logic
 *      return new User(entry)
 *    }
 * @param {Object|Object[]} configs - see fileUploaded() for config props
 * @returns {Function} decorator - that handles files upload/update/delete with all validations required
 */
export function filesUploaded (...configs) {
  return function (target, key, descriptor) {
    const func = descriptor.value
    descriptor.value = async function (...args) {
      const [, {entry}, {user: {id, auth} = {}}] = args

      // First, extract files from payload entry so it doesn't get assigned to instance
      const filesByFieldList = configs.map(({fields = 'files'}) => {
        const filesByField = {}
        toList(fields, 'clean').forEach(field => {
          filesByField[field] = toList(get(entry, field), 'clean')
          deleteProp(entry, field)
        })
        return filesByField
      })

      // Second, apply all other decorators to get entry instance.
      // If the result is a Promise, resolve it, else use as is without resolving
      let instance = func.apply(this, args)
      instance = (instance instanceof Promise) ? (await instance) : instance
      if (instance instanceof Error) return instance
      if (!(instance instanceof mongoose.Document))
        return Response.badImplementation(`@${filesUploaded.name} requires a Mongoose Document instance as return value`)

      // Third, process all file uploads with validation
      const promises = []
      let user, uploadLimit, uploadRemain
      for (const index in configs) {
        const {fields, uploadLimit: _uploadLimit, uploadLimitlessLevel, User, ...config} = configs[index]

        if (_uploadLimit && !User)
          return Response.badImplementation(`@${filesUploaded.name} requires User model for 'uploadLimit' validation`)

        // Enforce uploadLimit if `uploadLimitlessLevel` is nullable, or `auth` undefined, or less than required level
        if (_uploadLimit && (uploadLimitlessLevel == null || auth == null || !(auth >= uploadLimitlessLevel))) {

          // Only compute uploadLimit once
          if (uploadRemain == null) {
            let uploadUsed = 0
            user = await User.findById(id)
            if (!(user instanceof User))
              return Response.badImplementation(`@${filesUploaded.name} no User found with id ${id} to run 'uploadLimit' validation`)

            // Mongoose Map can only be retrieved with .get()
            if (user.uploadUsed) {
              for (const [key, value] of user.uploadUsed.entries()) {
                if (key.indexOf(instance.id) === 0) continue
                uploadUsed += value
              }
            }

            // Note: after image resize, user may end up exceeding quota, and cannot update other files
            // so always convert to positive value if the remaining quota is negative
            uploadLimit = user.uploadLimit || SIZE_MB_10 // fallback if limit is not defined
            uploadRemain = Math.abs(uploadLimit - uploadUsed) || SIZE_MB_10 // fallback in case of 0 or NaN
          }

          // Set uploadLimit in Bytes
          config.uploadLimit = uploadLimit
          config.uploadRemain = uploadRemain
        }

        promises.push(fileUploaded({instance, filesByField: filesByFieldList[index], ...config}))
      }
      const {resolve, reject} = await PromiseAll.all(promises)
      reject.forEach(warn)

      // Finally, check the results to return.
      // If any upload fails, do not save the record to avoid broken database and return the error.
      let uploadUsed = 0
      const error = resolve.find(({success, uploadSize}) => {
        uploadUsed += uploadSize
        return !success
      })
      if (error) return error

      // Save record for successful uploads
      if (uploadUsed) {
        user.set(`uploadUsed.${instance.id}`, uploadUsed)
        user.save()
      }
      return instance.save()
    }
    return descriptor
  }
}

/**
 * Process Files Upload for given Config
 * @param {String|String[]} [fields] - path to files field as defined in given model instance
 * @param {*[]} [kinds] - allowed file kinds
 * @param {*[]} [is] - allowed file identifiers
 * @param {String[]} [mimetypes] - allowed file types
 * @param {Boolean} [multiple] - whether upload should be saved as list of files for each given `field`
 * @param {Function} [update<{instance, files}>] - custom callback to update instance with uploaded files
 * @param {Object<[folder], [dir], [limit]>} [options] - custom upload configs, see `updateFiles` arguments
 */
async function fileUploaded ({
  kinds = [], // enables validation by default
  is = [], // pass as null to disable validation
  mimetypes = IMAGE.MIME_TYPES,
  multiple,
  update,
  uploadLimit, // total upload size in Bytes from User account, if `config.uploadLimit` = truthy
  uploadRemain, // computed remaining upload size in Bytes from User account, if `config.uploadLimit` = truthy
  instance, // private prop from filesUploaded()
  filesByField,  // private prop from filesUploaded()
  ...options
} = {}) {
  // Simply save the instance, if no files uploaded
  const success = true
  const fileInputs = toFlatList(Object.values(filesByField))
  if (!fileInputs.length) return {success}

  // Validate FileInput before uploads
  if (kinds) {
    for (const {kind} of fileInputs) {
      if (kind != null && !kinds.includes(kind))
        return Response.badRequest(interpolateString(_.INVALID_FILE_KIND_kind_MUST_BE_ONE_OF_kinds, {kind, kinds}))
    }
  }
  if (is) {
    for (const {i} of fileInputs) {
      if (i != null && !is.includes(i))
        return Response.badRequest(interpolateString(_.INVALID_FILE_IDENTIFIER_i_MUST_BE_ONE_OF_is, {i, is}))
    }
  }

  // Validate File types, and upload limit (can only count byte stream to get size)
  let uploadSize = 0 // total upload size should not exceed User's upload limit
  let error, validateStream
  for (const {file} of fileInputs) {
    if (!file) continue // file may be removed
    const {createReadStream, mimetype} = await file

    if (mimetypes && !mimetypes.includes(mimetype))
      return Response.badRequest(interpolateString(_.INVALID_FILE_TYPE_mimetype, {mimetype}, {suppressError: true}))

    if (uploadLimit) {
      validateStream = createReadStream()
      for await (const chunk of validateStream) { // see https://github.com/jaydenseric/graphql-upload/issues/204
        uploadSize += chunk.byteLength
        if (uploadSize > uploadRemain) {
          error = Response.badRequest(interpolateString(
            _.UPLOAD_LIMIT_EXCEEDED_YOU_HAVE_remaining_LEFT_OF_MAXIUM_size_FOR_ALL_UPLOADS_PLEASE_REDUCE_FILE_SIZES_OR_CONTACT_SUPPORT,
            {
              remaining: `${shortNumber(uploadRemain, 3, SIZE_KB)}B`,
              size: `${shortNumber(uploadLimit, 3, SIZE_KB)}B`,
            }
          ))
          break
        }
      }
      validateStream.destroy()
      validateStream = null
    }

    if (error) return error
  }

  // Upload/Update/Remove Files
  const updates = []
  for (const field in filesByField) {
    if (!filesByField[field].length) continue
    updates.push(updateFiles({instance, files: filesByField[field], field, ...options}))
  }

  // Resolve results
  const {resolve, reject} = await PromiseAll.all(updates)
  resolve.forEach(({field, files, errors}) => {
    // todo: test returning array of promises with errors
    // @see: https://stackoverflow.com/questions/67378814/apollo-server-throw-multiple-errors-with-partial-data
    if (!files) return // files can be empty array if a single file was removed
    if (update) {
      update({instance, field, files, errors})
    } else {
      set(instance, field, multiple ? files : files[0])
    }
  })
  reject.forEach(warn)
  return {success, uploadSize}
}

/**
 * Process Files Upload/Update/Removal for given Mongoose model instance.
 * Returns new full files list [FileInput|ImageInput] ready for saving the instance.
 *
 * @param {Document} instance - of Mongoose model containing files to be updated
 * @param {Object<file, kind, i, id, remove>[]} files - list of `FileInput` from resolver payload
 * @param {String} field - path to files field as defined in given model instance
 * @param {String} [folder] - see `resolvePath()` for argument
 * @param {Object} [filePath] - see `resolvePath()` for argument
 * @param {Object} [sizes] - required for image sharp.resize() see `resizes()` for argument
 * @param {Number} [limit] - maximum number of files allowed for upload (for unstructured `index` based files)
 * @returns {Promise<Object>} {field, files, errors}
 *    - `files` is updated files field for model instance to save, can be `undefined` if nothing updated
 *    - `errors` optional list of encountered rejections
 */
export async function updateFiles ({
  instance, files, field, folder = folderFrom(instance),
  limit, sizes,
  ...filePath
}) {
  const output = {field}

  // Populate fileInput with `filename` attribute required for removal to resolvePath()
  const oldFiles = toList(get(instance, field), 'clean') // field can be a single or list of FileInputs
  if (oldFiles.length) {
    files = files.map(fileInput => {
      if (fileInput.remove) {
        const fileID = fileId(fileInput)
        fileInput.name = (oldFiles.find(({kind, i, id}) => fileId({kind, i, id}) === fileID) || {}).name
      }
      return fileInput
    })
  }

  // Upload/Remove files
  const fileInputs = limit != null ? files.filter(f => f.i < limit) : files
  const uploads = fileInputs.map(fileInput => uploadFile({sizes, ...fileInput}, {folder, ...filePath}))
  const {resolve, reject} = await PromiseAll.all(uploads)

  // Error Handling
  // This should always resolve, because successful file uploads are already saved,
  // we need to update database for them.
  // For failed uploads, simply ignore.
  if (reject.length) {
    // To simplify UI, we will not throw error, because it may be
    // caused by uploading, then removing file, then uploading another file and save.
    // The server then uploads successfully another file, but fails to remove the not-yet uploaded file,
    // which causes unlink error for non-existing file path.
    warn(`❌ ${uploadFile.name}() has error ${toJSON(reject, null, 2)}`)
    output.errors = reject
  }

  // Create/Update Files list for Updated/Removed Files
  if (resolve.length) {
    output.files = oldFiles.length ? [...oldFiles] : []
    instance.markModified(field) // needed to update nested arrays in Mongoose
    const created = Date.now()
    const updated = Date.now()
    resolve.forEach(({path, removed, ...fileInput}) => {
      const fileID = fileId(fileInput) // a file can have different versions under the same ID
      if (removed) {
        // @note: when iterating array of Mongoose sub-documents (nested Schemas), need to explicitly destruct all props
        output.files = output.files.filter(({kind, i, id}) => fileId({kind, i, id}) !== fileID)
      } else if (path) {
        const index = output.files.findIndex(({kind, i, id}) => fileId({kind, i, id}) === fileID)
        if (index > -1) {
          fileInput.updated = updated
          output.files[index] = Object.assign(output.files[index], fileInput)
        } else {
          fileInput.created = created
          output.files.push(fileInput)
        }
      }
    })
  }

  // Return empty list, or updated fileInputs, if upload/remove successful
  // => this is the expected behavior, because Mongoose does not update arrays, unless marked as modified
  return output
}

/**
 * Process File Upload
 * todo: remove old file with different extension (does not get overridden)
 *
 * @param {Object<kind, i, id>} fileInput - File props from resolver payload
 * @param {File} [file] - required for upload, native File object to createReadStream()
 * @param {Boolean} [remove] - whether to remove file
 * @param {String} [name] - existing file `name` to remove, required to resolvePath()
 * @param {Object} [filePath] - options to pass to `saveFile()` or `removeFile()`
 * @returns {Promise} Promise<path...>|Promise<removed...>
 *   - given FileInput props with saved `path`, `name`, and optional `metaData`
 *   - or `removed` boolean
 *   - or error if unsuccessful
 */
export async function uploadFile ({file, remove, sizes = IMAGE.SIZES, ...fileInput}, filePath) {
  let result

  // Remove File
  if (remove) {
    filePath = {filename: fileName(fileInput), ...filePath}
    if (IMAGE.EXTENSIONS.includes(fileFormatNormalized(filePath.filename))) {
      result = await removeImgSizes({filePath, sizes})
    } else {
      result = await removeFile(filePath)
    }
    if (!result.removed)
      throw Response.badRequest(interpolateString(_.REMOVE_FILE_ERROR_error, {error: result}))
    return {...fileInput, removed: result.removed}
  }

  // Upload File (use filename derived from the file itself)
  const {createReadStream, filename: name, mimetype} = await file
  const options = {stream: createReadStream(), filePath: {filename: fileName({...fileInput, name}), ...filePath}}
  if (IMAGE.MIME_TYPES.includes(mimetype)) {
    // Always resize the image using Sharp, so sharp can optimize and sanitize it, even if resizing is not needed
    result = await saveImgSizes({...options, sizes})
  } else {
    result = await saveFile(options)
  }
  if (!result.path)
    throw Response.badRequest(interpolateString(_.UPLOAD_FILE_ERROR_error, {error: result}))
  // @note: - `name` is for UI, does not match `path` for the actual file
  //        - `metaData` is from the original file, the actual width/height may be smaller (i.e. VALIDATE.IMAGE_MAX_RES)
  return {...fileInput, ...result, name: sanitize(name)}
}

// Translations
localiseTranslation({
  INVALID_FILE_KIND_kind_MUST_BE_ONE_OF_kinds: {
    [l.ENGLISH]: `Invalid file kind '{kind}', must be one of [{kinds}]`
  },
  INVALID_FILE_IDENTIFIER_i_MUST_BE_ONE_OF_is: {
    [l.ENGLISH]: `Invalid file identifier '{i}', must be one of [{is}]`
  },
  INVALID_FILE_TYPE_mimetype: {
    [l.ENGLISH]: `Invalid file type '{mimetype}`
  },
  REMOVE_FILE_ERROR_error: {
    [l.ENGLISH]: `Remove file error '{error}!`
  },
  UPLOAD_FILE_ERROR_error: {
    [l.ENGLISH]: `Upload file error '{error}!`
  },
  UPLOAD_LIMIT_EXCEEDED_YOU_HAVE_remaining_LEFT_OF_MAXIUM_size_FOR_ALL_UPLOADS_PLEASE_REDUCE_FILE_SIZES_OR_CONTACT_SUPPORT: {
    [l.ENGLISH]: `Upload limit exceeded! You have {remaining} left of maximum {size} for ALL Uploads. Please reduce file sizes or contact support.`
  },
})
