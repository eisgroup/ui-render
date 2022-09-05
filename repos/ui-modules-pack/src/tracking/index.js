import { NAME } from './constants'

/**
 * App Tracking:
 * - Cookie Policy Acceptance (GDPR)
 * - First Visit Timestamp
 * - Google Analytics
 * - Referral Code
 * => Tracking can be initialized by wrapping `App.js` using `withTracker`
 *
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './constants'
export * from './utils'
export {
  NAME,
}

const tracking = {
  NAME,
}

export default tracking
