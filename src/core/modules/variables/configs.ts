import { THREE_SECONDS } from '../../utils'

/**
 * APP CONFIGURATIONS ==========================================================
 * =============================================================================
 */

/* UI */
export const UI = {
  TYPING_DELAY: 300, // Milliseconds - 300 is ideal for debouncing input changes while typing
  TOOLTIP_DELAY: 777, // Milliseconds
  FORM_SYNC_THROTTLE: THREE_SECONDS, // Milliseconds - debounce input changes duration
  ANIMATION_DURATION: 500, // Milliseconds - match with CSS @speed-base in /repos/web/style/_variables.less
}
