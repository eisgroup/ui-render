import { _WORK_DIR_, ENV, SIZE_MB_16, SIZE_MB_2 } from 'utils-pack'

/**
 * FILE VARIABLES ==============================================================
 * =============================================================================
 */

/* File Uploads */
export const FILE_TYPE = {
  JSON: 'json',
  IMAGE: 'image',
  SOUND: 'sound',
  VIDEO: 'video',
}

export const UPLOAD = {
  DIR: `/uploads`, // relative to site's root for frontend, and _WORK_DIR_ for backend
  BY_ROUTE: {
    [FILE_TYPE.JSON]: {fileTypes: '.json', maxSize: SIZE_MB_16},
    [FILE_TYPE.IMAGE]: {fileTypes: '.jpg, .jpeg, .png', maxSize: SIZE_MB_2},
    [FILE_TYPE.SOUND]: {fileTypes: '.mp3', maxSize: SIZE_MB_16},
    [FILE_TYPE.VIDEO]: {fileTypes: '.mp4', maxSize: SIZE_MB_16},
  },
}
UPLOAD.PATH = ENV.UPLOAD_PATH || `${_WORK_DIR_}${UPLOAD.DIR}` // full upload path

export const IMAGE = {
  MAX_RES: 1200
}

/**
 * Create relative upload File path (or File Name) for use in absolute File `src` string
 * in this format: `{id}/{kind}_{i}.{ext}`
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
 *
 * @param {FileInput|Object<[id], [kind], [i], [ext]>} file - FileInput object (ex. from GraphQL)
 * @returns {String} path - relative file path, including file name and optional extension
 */
export function filePath (file) {
  let {id, kind, i, ext} = file
  id = id != null ? String(id) : ''
  kind = kind != null ? String(kind) : ''
  i = i != null ? String(i) : ''
  ext = ext != null ? String(ext) : ''
  const slash = id && (kind || i) && '/'
  const _ = kind && i && '_'
  const dot = ext && '.'
  return `${id}${slash}${kind}${_}${i}${dot}${ext}`
}
