import { NAME } from './constants'
import { withTracker } from './utils'

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
export {
  NAME,
  withTracker
}

const tracking = {
  NAME,
}

export default tracking
