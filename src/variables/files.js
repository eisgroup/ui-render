import { FILE as _FILE } from 'ui-react-pack/files'
import { _WORK_DIR_, ENV, isList, SIZE_MB_16 } from 'ui-utils-pack'
import { fileFormatNormalized, fileNameWithoutExt, isFileSrc, mimeTypeFromDataUrl } from 'ui-utils-pack/string'

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
    BIN: 'application/octet-stream',
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

FILE.FORMAT_BY_MIME_TYPE = {
  [FILE.MIME_TYPE.BIN]: 'bin',
  [FILE.MIME_TYPE.CSV]: 'csv',
  [FILE.MIME_TYPE.GIF]: 'gif',
  [FILE.MIME_TYPE.JSON]: 'json',
  [FILE.MIME_TYPE.JPG]: 'jpg',
  [FILE.MIME_TYPE.MP3]: 'mp3',
  [FILE.MIME_TYPE.MP4]: 'mp4',
  [FILE.MIME_TYPE.PNG]: 'png',
  [FILE.MIME_TYPE.SVG]: 'svg',
  [FILE.MIME_TYPE.WEBP]: 'webp',
}

export const IMAGE = {
  MAX_RES: SIZE_MB_16, // total Image width*height resolution limit (16 MB is about 4K image)
  EXTENSIONS: [FILE.EXT.JPG, FILE.EXT.JPEG, FILE.EXT.PNG, FILE.EXT.SVG, FILE.EXT.GIF, FILE.EXT.WEBP],
  MIME_TYPES: [FILE.MIME_TYPE.JPG, FILE.MIME_TYPE.PNG, FILE.MIME_TYPE.SVG, FILE.MIME_TYPE.GIF, FILE.MIME_TYPE.WEBP],
  SIZES: { // default sharp.resize() config for image uploads
    // @see: https://sharp.pixelplumbing.com/api-resize
    '': {res: SIZE_MB_16}, // max 4K resolution for the original file
    medium: {width: 1200, height: 1200, fit: 'inside'},
    thumb: {width: 150, height: 150, fit: 'cover'},
  }
}

export const UPLOAD = {
  DIR: `/uploads`, // relative to site's root for frontend, and _WORK_DIR_ for backend
  BY_ROUTE: {
    [FILE.TYPE.JSON]: {fileTypes: '.json', maxSize: SIZE_MB_16},
    [FILE.TYPE.IMAGE]: {fileTypes: '.' + IMAGE.EXTENSIONS.join(', .'), maxSize: SIZE_MB_16},
    [FILE.TYPE.SOUND]: {fileTypes: '.mp3', maxSize: SIZE_MB_16},
    [FILE.TYPE.VIDEO]: {fileTypes: '.mp4', maxSize: SIZE_MB_16},
  },
}

// @important: for backend, insert this at the top of _init.js:
// import 'modules-pack/utils/server/config' // load .env file variables
// Bucket name must be empty string so that backend can set bucket during runtime
UPLOAD.PATH = `${ENV.CDN_BUCKET_NAME ? '' : (ENV.UPLOAD_PATH || _WORK_DIR_)}${UPLOAD.DIR}` // full upload path

/**
 * Create JS File Object from given URL
 * @param {String} url - to fetch file, can be Base64 string, http url, dataURL, blobURL, etc...
 * @param {String} filename - to use
 * @param {FilePropertyBag|undefined} [options] - attributes to pass to new File()
 * @returns {Promise<File>} file object if resolved
 */
export function fileFromUrl (url, filename, options) {
  return fetch(url)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, options))
}

/**
 * Get File Format Extension from Data URL String
 * @param {String} dataUrl - see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * @returns {String} format - example: 'png'
 */
export function fileFormatFromDataUrl (dataUrl) {
  return FILE.FORMAT_BY_MIME_TYPE[mimeTypeFromDataUrl(dataUrl)]
}

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
  const ext = name != null ? fileFormatNormalized(name) : ''
  const slash = id && (kind || i) && '/'
  const _ = kind && i && '_'
  const dot = ext && '.'
  return `${id}${slash}${kind}${_}${i}${dot}${ext}`
}

/**
 * Compute File Name with given Size label
 *
 * @param {String} filename - with extension, result of `fileName()`
 * @param {String} size - for given `filename`
 * @returns {String} filename with size added to the name.
 */
export function fileNameSized (filename, size) {
  if (!size) return filename
  const name = fileNameWithoutExt(filename)
  const ext = fileFormatNormalized(filename)
  const extension = ext ? `.${ext}` : ''
  return `${name}_${size}${extension}`
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
 * Parse <UploadGridField/> onChange(files) values to match Backend API
 * @param {FileInput[]|FileInput} files - single or list of FileInputs to parse
 * @returns {Object[]|Object|void} {file, kind, i, remove}[] - single or list of FileInputs for backend
 */
export function fileParser (files) {
  if (isList(files)) {
    const list = files.map(fileParser).filter(v => v)
    if (list.length) return list
  } else {
    const {file, kind, i, remove} = files
    if (file) return {file, kind, i}
    if (remove) return {kind, i, remove}
  }
}

/**
 * Parse <UploadGridField/> onChange(files) values to have `kind` as given
 * @param fileInput
 * @param {String} kind - to use
 * @returns {{kind, remove}|{file, kind}} fileInput for backend with kind inserted
 */
export function fileKindParser (fileInput, kind) {
  const {file, remove} = fileInput
  if (file) return {file, kind}
  if (remove) return {kind, remove}
}

/**
 * Load Image file
 *
 * @param {String} src - full image file path
 * @return {Promise<Image|Error>} promise - resolves to loaded Image file or error
 */
export function loadImage (src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Compute Image `preview` URL/pathname (can accept Base64 string) in different sizes for consumption by frontend:
 *  - `preview` matches original `src`
 *  - `preview.medium` matches medium size of `src`
 *  - `preview.thumb` matches thumbnail size of `src`
 *
 * => pass in `null` as the second parameter to disable default fallback to IMAGE.SIZES.
 *
 * @example:
 *    const preview = previewSizes(image)
 *    preview == image.src >>> true
 *    preview.medium >>> string
 *    preview.thumb >>> string
 *
 * Scenarios:
 *  1. Production file: use `src` suffixed with 'medium' for default size, else `src` as 'original'
 *  2. Local dev file: user `src` as base64 data if it is of base64 type, else same as point 1.
 * @param {Object} - FileInput with `src` and optional `sizes` attribute (ex. [{key: 'medium', val: 99}])
 * @param {String[]|Null} [resKeys] - use predefined image size keys when FileInput.sizes not available
 * @return {Object|Undefined} preview<medium, thumb...> - string object with sizes attached as props of `preview`
 */
export function previewSizes ({src, sizes}, resKeys = imgSizes) {
  if (!src) return
  if ((sizes || resKeys) && isFileSrc(src)) {
    // noinspection JSPrimitiveTypeWrapperUsage
    const preview = new String(src)
    if (sizes) {
      for (const size of sizes) {
        const {key} = size
        if (!key) continue
        preview[key] = fileNameSized(src, key)
      }
    } else {
      // fallback is needed to compute sizes for EntrySummary that likely doesn't query `sizes`,
      resKeys.forEach(key => key && (preview[key] = fileNameSized(src, key)))
    }
    return preview
  }
  return src
}

const imgSizes = Object.keys(IMAGE.SIZES)
