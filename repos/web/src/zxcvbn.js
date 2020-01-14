import { asyncLoad } from 'core/src/common/utils/utility'
import { ACTIVE } from 'core/src/common/variables'

/**
 * WEB INITIALISATION ==========================================================
 * Password checker library (adds about 800 KB to bundle size)
 * =============================================================================
 */

// Lazy load Password Checker
// cross-browser asynchronous script loading for zxcvbn.
// adapted from http://friendlybit.com/js/lazy-loading-asyncronous-javascript/
asyncLoad('/static/js/zxcvbn.js', () => ACTIVE.passwordCheck = window.zxcvbn)
