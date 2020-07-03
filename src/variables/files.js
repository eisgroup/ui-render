import { _WORK_DIR_, ENV, SIZE_MB_16, SIZE_MB_2 } from 'utils-pack'

/**
 * FILE VARIABLES ==============================================================
 * =============================================================================
 */

/* File Uploads */
export const FILE_TYPE = {
  JSON: 'json',
  IMAGE: 'images',
  SOUND: 'sounds',
  VIDEO: 'videos',
  VIDEO_SOUND: 'videos-with-sound'
}
export const IMAGE_MAX_RES = 1200
export const UPLOAD_DIR = `/uploads` // relative to site's root for frontend, and _WORK_DIR_ for backend
export const UPLOAD_PATH = ENV.UPLOAD_PATH || `${_WORK_DIR_}${UPLOAD_DIR}`
export const UPLOAD_BY_ROUTE = {
  [FILE_TYPE.JSON]: {fileTypes: '.json', maxSize: SIZE_MB_16},
  [FILE_TYPE.IMAGE]: {fileTypes: '.jpg, .jpeg', maxSize: SIZE_MB_2},
  [FILE_TYPE.VIDEO]: {fileTypes: '.mp4', maxSize: SIZE_MB_16}
}
