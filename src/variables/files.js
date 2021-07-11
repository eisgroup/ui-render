import { FILE as _FILE } from 'react-ui-pack/files'
import { _WORK_DIR_, ENV, fileExtensionNormalized, fileNameWithoutExt, isList, SIZE_MB_16, SIZE_MB_2 } from 'utils-pack'

/**
 * FILE VARIABLES ==============================================================
 * =============================================================================
 */

export const FILE = {
  ..._FILE,
  EXT: {
    CSV: 'csv',
    GIF: 'gif',
    JSON: 'json',
    JPG: 'jpg',
    JPEG: 'jpeg',
    MP3: 'mp3',
    MP4: 'mp4',
    PNG: 'png',
    SVG: 'svg',
    WEBP: 'webp',
  },
  MIME_TYPE: {
    CSV: 'text/csv',
    GIF: 'image/gif',
    JSON: 'application/json',
    JPG: 'image/jpeg',
    MP3: 'audio/mpeg',
    MP4: 'video/mp4',
    PNG: 'image/png',
    SVG: 'image/svg+xml',
    WEBP: 'image/webp',
  },
  // File Uploads
  TYPE: {
    JSON: 'json',
    IMAGE: 'image',
    SOUND: 'sound',
    VIDEO: 'video',
  },
}

export const IMAGE = {
  MAX_RES: 1200,
  EXTENSIONS: [FILE.EXT.JPG, FILE.EXT.JPEG, FILE.EXT.PNG, FILE.EXT.SVG, FILE.EXT.GIF, FILE.EXT.WEBP],
  MIME_TYPES: [FILE.MIME_TYPE.JPG, FILE.MIME_TYPE.PNG, FILE.MIME_TYPE.SVG, FILE.MIME_TYPE.GIF, FILE.MIME_TYPE.WEBP],
}

export const UPLOAD = {
  DIR: `/uploads`, // relative to site's root for frontend, and _WORK_DIR_ for backend
  BY_ROUTE: {
    [FILE.TYPE.JSON]: {fileTypes: '.json', maxSize: SIZE_MB_16},
    [FILE.TYPE.IMAGE]: {fileTypes: '.' + IMAGE.EXTENSIONS.join(' .'), maxSize: SIZE_MB_2},
    [FILE.TYPE.SOUND]: {fileTypes: '.mp3', maxSize: SIZE_MB_16},
    [FILE.TYPE.VIDEO]: {fileTypes: '.mp4', maxSize: SIZE_MB_16},
  },
}
UPLOAD.PATH = ENV.UPLOAD_PATH || `${_WORK_DIR_}${UPLOAD.DIR}` // full upload path

/**
 * Create File Name (with optional ID folder) from FileInput object in this format:
 * `{id}/{kind}_{i}.{ext}` - for use in File `src` string for frontend and backend.
 *
 * @example: possible outputs
 *    const file = {id: 'test', kind: 'public', i: 'thumb', ext: 'jpg'}
 *    >>> 'test/public_thumb.jpg'
 *    const file = {id: 'test', kind: 'public', ext: 'jpg'}
 *    >>> 'test/public.jpg'
 *    const file = {id: 'test', i: 'thumb'}
 *    >>> 'test/thumb'
 *    const file = {id: 'test', ext: 'jpg'}
 *    >>> 'test.jpg'
 *    const file = {ext: 'jpg'}
 *    >>> '.jpg'
 *
 * @param {FileInput|Object<id, kind, i, name>} fileInput - FileInput object (ex. from GraphQL)
 * @returns {string} filename - including optional ID folder
 */
export function fileName (fileInput) {
  let {id, kind, i, name} = fileInput
  id = id != null ? String(id) : ''
  kind = kind != null ? String(kind) : ''
  i = i != null ? String(i) : ''
  const ext = name != null ? fileExtensionNormalized(name) : ''
  const slash = id && (kind || i) && '/'
  const _ = kind && i && '_'
  const dot = ext && '.'
  return `${id}${slash}${kind}${_}${i}${dot}${ext}`
}

/**
 * Compute Unique File ID for given FileInput props.
 * File can have different versions with the same `id`, thus need to combine other props as primary key.
 * @see `fileName()` for arguments and return value
 */
export function fileId ({name, ext, ...fileInput}) {
  return fileName(fileInput)
}

/**
 * Create File Upload Folder from given Mongoose Document Instance
 * @param {Document} instance - Mongoose doc
 * @returns {String} folder - in this format `{ModelName}/{id}`
 */
export function folderFrom (instance) {
  const {id, constructor: {modelName}} = instance
  return `/${modelName}/${id}`
}

/**
 * Standardizes how the absolute file path is computed
 * @param {String} [filename] - required if absolute `path` not given (ex. photo.jpg)
 * @param {String} [folder] - file directory path relative to `workDir`, if `dir` not given, must start with slash (ex. '/User')
 * @param {String} [workDir] - absolute working directory path, defaults to UPLOAD.PATH
 * @param {String} [dir] - absolute directory path, excluding file name (ex. `/root/uploads`), defaults to `workDir` + `folder`
 * @param {String} [path] - required if `filename` not given, absolute directory path, including file name (ex. `/root/uploads/old_image.jpg`)
 * @returns {Object} {dir, path, name}
 *    - `path` -> absolute path including filename,
 *    - `dir` -> without filename
 *    - `name` -> filename
 */
export function resolvePath ({filename = '', folder = '', dir = '', path = '', workDir = UPLOAD.PATH}) {
  if (!filename && !path) throw new Error(`${resolvePath.name}() requires either 'filename' or full absolute 'path'`)
  if (!path) {
    if (!dir) dir = `${workDir}${folder}`
    const _name = fileNameWithoutExt(filename)
    const slash = _name && '/' // turn directory into file when `filename` only has extension (ex. '.jpg')
    path = `${dir}${slash}${filename}`
    dir = _name ? dir : path.substr(0, path.lastIndexOf('/'))
  } else {
    dir = path.substr(0, path.lastIndexOf('/'))
  }
  const name = path.substr(path.lastIndexOf('/') + 1)
  return {dir, path, name}
}

/**
 * Parse <UploadGrid/> onChange(files) values to match Backend API
 * @param {FileInput[]|FileInput} files - single or list of FileInputs to parse
 * @returns {Object} {file, kind, i, remove}[] - single or list of FileInputs for backend
 */
export function fileParser (files) {
  if (isList(files)) {
    return files.map(fileParser)
  } else {
    const {file, kind, i, remove} = files
    return {file, kind, i, remove}
  }
}
