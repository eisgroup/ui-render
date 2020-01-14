import { SIZE_MB_16, SIZE_MB_2 } from '../constants'
import { _WORK_DIR_, ENV } from './_envs'
import { PATH_SOUNDS } from './configs'
import { DEFAULT } from './defaults'

/**
 * FILE VARIABLES ==============================================================
 * =============================================================================
 */

/* File Uploads */
export const FILE_TYPE = {
  IMAGE: 'images',
  SOUND: 'sounds',
  VIDEO: 'videos',
  VIDEO_SOUND: 'videos-with-sound'
}
export const IMAGE_MAX_RES = 1200
export const UPLOAD_DIR = `/uploads` // relative to site's root for frontend, and _WORK_DIR_ for backend
export const UPLOAD_PATH = ENV.UPLOAD_PATH || `${_WORK_DIR_}${UPLOAD_DIR}`
export const UPLOAD_BY_ROUTE = {
  [FILE_TYPE.IMAGE]: {fileTypes: '.jpg, .jpeg', maxSize: SIZE_MB_2},
  [FILE_TYPE.VIDEO]: {fileTypes: '.mp4', maxSize: SIZE_MB_16}
}

/* Sounds */
export const SOUND = {
  ALERT: soundFile('alert.mp3'),
  INCREASE: soundFile('increase.mp3'),
  DECREASE: soundFile('decrease.mp3'),
  PRESS: soundFile('press.mp3'),
  PROGRESS: soundFile('progress.mp3'),
  TOUCH: soundFile('touch.mp3'),
  SWOOSH: soundFile('swoosh.mp3'),
  SLIDE: soundFile('slide.mp3'),
}

/**
 * HELPER FUNCTIONS ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Lazy Load Sound File with safe .play() method that is muted when sound is off
 *
 * @param {String} name - sound file name
 * @returns {Object<{play()}>} - object with .play() method
 */
function soundFile (name) {
  let file
  return {
    play () {
      if (!file) file = new Audio(PATH_SOUNDS + name)
      if (DEFAULT.SETTINGS.HAS_SOUND && file) file.play().catch(console.error)
    }
  }
}
