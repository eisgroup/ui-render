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
