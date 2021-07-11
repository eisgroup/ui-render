import { SevenBoom as Response } from 'graphql-apollo-errors'
import { fileId, fileName, folderFrom, IMAGE } from 'modules-pack/variables'
import mongoose from 'mongoose'
import PromiseAll from 'promises-all'
import { get, interpolateString, l, localiseTranslation, toJSON, toList, warn } from 'utils-pack'
import { _ } from 'utils-pack/translations'
import { removeFile, sanitize, saveFile } from './file'
import { resize } from './image'

/**
 * UPLOAD PROCESS HELPERS ======================================================
 * =============================================================================
 */

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
})

/**
 * Process File Upload
 *
 * @param {Object<kind, i, id>} fileInput - File props from resolver payload
 * @param {File} [file] - required for upload, native File object to createReadStream()
 * @param {Boolean} [remove] - whether to remove file
 * @param {String} [name] - existing file `name` to remove, required to resolvePath()
 * @param {String[]} [mimetypes] - allowed file types
 * @param {Object} [filePath] - options to pass to `saveFile()` or `removeFile()`
 * @returns {Promise<path...>|Promise<removed...>} - given FileInput props with saved `path` and `name`,
 *   - or `removed` boolean
 *   - or error if unsuccessful
 */
export async function uploadFile ({file, remove, mimetypes, ...fileInput}, filePath) {
  // Remove File
  if (remove) {
    const result = await removeFile({filename: fileName(fileInput), ...filePath})
    if (!result.removed)
      throw Response.badRequest(interpolateString(_.REMOVE_FILE_ERROR_error, {error: result}))
    return {...fileInput, removed: result.removed}
  }
  // Upload File (use filename derived from the file itself)
  const {createReadStream, filename: name, mimetype} = await file
  if (mimetypes && !mimetypes.includes(mimetype))
    throw Response.badRequest(interpolateString(_.INVALID_FILE_TYPE_mimetype, {mimetype}))

  const stream = createReadStream()
  const result = await saveFile({stream, transform: resize(), filename: fileName({...fileInput, name}), ...filePath})
  if (!result.path)
    throw Response.badRequest(interpolateString(_.UPLOAD_FILE_ERROR_error, {error: result}))
  return {...fileInput, ...result, name: sanitize(name)} // `name` is for UI, does not match `path` for the actual file
}

// noinspection JSUnresolvedVariable
/**
 * Process Files Upload/Update/Removal for given Mongoose model instance.
 * Returns new full files list [FileInput] ready for saving the instance.
 *
 * @param {Document} instance - of Mongoose model containing files to be updated
 * @param {Object<file, kind, i, id, remove>[]} files - list of `FileInput` from resolver payload
 * @param {String} [field] - path to files field as defined in given model instance
 * @param {String} [folder] - see `resolvePath()` for argument
 * @param {Object} [filePath] - see `resolvePath()` for argument
 * @param {String[]} [mimetypes] - allowed file types
 * @param {Number} [limit] - maximum number of files allowed for upload (for unstructured `index` based files)
 * @returns {Promise<Object>} {result, errors}
 *    - `result` is updated files field for model instance to save, can be empty [] if nothing to updated
 *    - `errors` optional list of encountered rejections
 */
export async function updateFiles ({
  instance, files, field = 'files', folder = folderFrom(instance),
  mimetypes = IMAGE.MIME_TYPES, limit,
  ...filePath
}) {
  const output = {result: []}

  // Populate fileInput with `filename` attribute required for removal to resolvePath()
  const oldFiles = get(instance, field, [])
  if (oldFiles.length) {
    files = files.map(fileInput => {
      if (fileInput.remove) {
        const fileID = fileId(fileInput)
        fileInput.name = (oldFiles.find(oldInput => fileId(oldInput) === fileID) || {}).name
      }
      return fileInput
    })
  }

  // Upload/Remove files
  const fileInputs = limit != null ? files.filter(f => f.i < limit) : files
  const uploads = fileInputs.map(fileInput => uploadFile({mimetypes, ...fileInput}, {folder, ...filePath}))
  const {resolve, reject} = await PromiseAll.all(uploads)

  // Error Handling
  // This should always resolve, because successful file uploads are already saved,
  // we need to update database for them.
  // For failed uploads, simply ignore.
  if (reject.length) {
    // To simplify UI, we will not throw error, because it may be
    // caused by uploading, then removing file too quickly,
    // which causes unlink error for non-existing file path
    warn(`❌ ${uploadFile.name}() has error ${toJSON(reject, null, 2)}`)
    output.errors = reject
  }

  // Create/Update Files list for Updated/Removed Files
  if (resolve.length) {
    if (oldFiles) output.result = [...oldFiles]
    instance.markModified(field) // needed to update nested arrays in Mongoose
    const created = Date.now()
    const updated = Date.now()
    resolve.forEach(({path, removed, ...fileInput}) => {
      if (fileInput.created == null) fileInput.created = created
      const fileID = fileId(fileInput) // a file can have different versions under the same ID
      if (removed) {
        output.result = output.result.filter(oldInput => fileId(oldInput) !== fileID)
      } else if (path) {
        const index = output.result.findIndex(oldInput => fileId(oldInput) === fileID)
        if (index > -1) {
          fileInput.updated = updated
          output.result[index] = fileInput
        } else {
          output.result.push(fileInput)
        }
      }
    })
  }

  // Return empty list, or updated fileInputs, if upload/remove successful
  // => this is the expected behavior, because Mongoose does not update arrays, unless marked as modified
  return output
}

/**
 * Decorator to handle File Uploads for GraphQL Resolvers
 * @description:
 *    - the resolver must return a Mongoose model instance
 *    - this decorator should be the last because it calls .save()
 *
 * This uses a flexible structured file name system by design, which allows both
 * unstructured index based files, as well as ID or custom folder based uploads.
 * The structure comes from `FileInput` fields: `kind`, `i`, `id` and `name` (computed by the server).
 * If above fields are omitted, the server falls back to entry ID for file name.
 *
 * @example:
 *   *@filesUploaded({field: 'files', mimeTypes: IMAGE.MIME_TYPES}) // defaults
 *    user (parent, args, context, info) {
 *      // ...resolver logic
 *      return new User(entry)
 *    }
 *
 * @param {String} [field] - path to files field as defined in given model instance
 * @param {*[]} [kinds] - allowed file kinds
 * @param {*[]} [is] - allowed file identifiers
 * @param {Object<[folder], [dir], [limit], [mimetypes]>} [options] - custom upload configs, see `updateFiles` arguments
 * @returns {Function} decorator - that handles files upload/update/delete with all validations required
 */
export function filesUploaded ({
  field = 'files',
  kinds,
  is,
  ...options
} = {}) {
  return function (target, key, descriptor) {
    const func = descriptor.value
    descriptor.value = async function (...args) {
      // If result is a Promise, resolve it, else use as is without resolving
      let instance = func.apply(this, args)
      instance = (instance instanceof Promise) ? (await instance) : instance
      if (instance instanceof Error) return instance
      if (!(instance instanceof mongoose.Document))
        return Response.badImplementation(`@${filesUploaded.name} requires a Mongoose Document instance as return value`)

      // Simply save the instance, if no files uploaded
      const [__, {entry}] = args
      const files = toList(entry[field], 'clean')
      if (!files.length) return instance.save()

      // Validate FileInput before uploads
      if (kinds) {
        for (const {kind} of files) {
          if (!kinds.includes(kind))
            return Response.badRequest(interpolateString(_.INVALID_FILE_KIND_kind_MUST_BE_ONE_OF_kinds, {kind, kinds}))
        }
      }
      if (is) {
        for (const {i} of files) {
          if (!is.includes(i))
            return Response.badRequest(interpolateString(_.INVALID_FILE_IDENTIFIER_i_MUST_BE_ONE_OF_is, {i, is}))
        }
      }

      // Upload/Update/Remove Files
      // todo: test returning array of promises with errors
      // @see: https://stackoverflow.com/questions/67378814/apollo-server-throw-multiple-errors-with-partial-data
      const {result, errors} = await updateFiles({instance, files, field, ...options})
      instance[field] = result
      return instance.save()
    }
    return descriptor
  }
}
