import { Active, ENV, get, warn } from 'ui-utils-pack'

/**
 * FILE VARIABLES ==============================================================
 * =============================================================================
 */

export const CDN_URL = ENV.REACT_APP_CDN_URL || ''

export const FILE = {
  PATH_IMAGES: `${CDN_URL}/static/images/`,
  PATH_SOUNDS: `${CDN_URL}/static/sounds/`,
  CDN_URL,
}

if (get(Active, 'SETTINGS.HAS_SOUND') == null) {
  Active.SETTINGS = {
    ...Active.SETTINGS,
    HAS_SOUND: false
  }
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
      // IE 11 does not support Audio()
      if (!file) try {
        file = new Audio(FILE.PATH_SOUNDS + name)
      } catch (err) {
        warn(err)
      }
      if (Active.SETTINGS.HAS_SOUND && file) file.play().catch()
    }
  }
}
