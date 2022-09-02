import { GET, getParamByKey, performStorage, SET } from 'ui-utils-pack'
import {
  COOKIE_ACCEPTED_TIMESTAMP_KEY,
  EXCLUDED_TRACKING_INVITE_CODE,
  FIRST_VISIT_TIMESTAMP_KEY,
  REF,
  USER
} from './constants'

/**
 * HELPER FUNCTIONS ============================================================
 * =============================================================================
 */

export const tracking = {
  /**
   * Initialize Analytics Tracking
   * @example:
   *   import GoogleAnalytics from 'react-ga'
   *   const initAnalytics = (trackingId, tracking) => {
   *     tracking.ga = GoogleAnalytics
   *     tracking.ga.initialize(trackingId)
   *     if (this.user) tracking.ga.set({userId: this.user})
   *   }
   *   tracking.init(ENV.REACT_APP_ANALYTICS_TRACKING_ID, initAnalytics)
   *
   * @param {String|undefined} analyticsTrackingId
   * @param {Function} initAnalytics - Callback(this) instance to initialize Analytics if activated
   */
  init (analyticsTrackingId, initAnalytics) {
    this.setFirstVisitTimestamp()
    this.setReferrer()
    this.setUser()
    this.setAnalytics(analyticsTrackingId, initAnalytics)
  },

  /**
   * Verify if Cookie Policy Acceptance is Required
   * @return {Boolean} true - if cookie policy has not been accepted, or is more than 12 months ago
   */
  get showCookiePolicy () {
    this.cookieAcceptedTimestamp = Number(performStorage(GET, COOKIE_ACCEPTED_TIMESTAMP_KEY))
    const lastAcceptedTimestamp = Math.floor(Date.now() / 1000) - (3600 * 60 * 24 * 365)  // check every 12 months
    return (!this.cookieAcceptedTimestamp || this.cookieAcceptedTimestamp < lastAcceptedTimestamp)
  },

  /** Mark Timestamp When User Accepted Cookie Policy */
  setCookieAcceptance () {
    performStorage(SET, COOKIE_ACCEPTED_TIMESTAMP_KEY, Math.floor(Date.now() / 1000).toString())
  },

  /**
   * Setup Google Analytics
   */
  setAnalytics (trackingId, initAnalytics) {
    // Only Activate Analytics on Production Site (if tracking ID given)
    // Disable Analytics if invite query string is defined as excluded from tracking
    const isProd = window.location.hostname !== 'localhost'
    const canTrack = this.refCode !== EXCLUDED_TRACKING_INVITE_CODE
    if (!trackingId || !isProd || !canTrack) {
      let reasons = []
      if (!trackingId) reasons.push('no tracking ID given')
      if (!isProd) reasons.push('running in local server')
      if (!canTrack) reasons.push('excluded tracking code detected')
      return console.log(`Analytics disabled because: \n- ${reasons.join('\n- ')}`)
    }

    /* Add utm_source query string if needed */
    const {val} = this.getRefFromParams()
    if (val) {
      const newURI = window.location.pathname + window.location.search + '&utm_source=' + val
      window.history.replaceState(null, null, newURI)
    }

    /* Initialize tracking data with Analytics */
    initAnalytics(trackingId, this)
  },

  setFirstVisitTimestamp () {
    this.firstVisitTimestamp = performStorage(GET, FIRST_VISIT_TIMESTAMP_KEY)

    // Set first visit timestamp
    if (!this.firstVisitTimestamp) {
      this.firstVisitTimestamp = Math.floor(Date.now() / 1000)
      performStorage(SET, FIRST_VISIT_TIMESTAMP_KEY, this.firstVisitTimestamp)
    }
  },

  getFirstVisitTimestamp () {
    if (!this.firstVisitTimestamp) this.setFirstVisitTimestamp()
    return this.firstVisitTimestamp
  },

  /**
   * Set User Info in Local Storage from Query String
   */
  setUser () {
    this.user = performStorage(GET, USER.STORAGE_KEY)

    // No Referrer Code Found in Local Storage
    if (!this.user) {
      this.getUserFromParams()

      // Set User Info in Local Storage for the First Time
      if (this.user) performStorage(SET, USER.STORAGE_KEY, this.user)
    }
  },

  getUser () {
    if (!this.user) this.setUser()
    return this.user
  },

  getUserFromParams () {
    this.user = getParamByKey(USER.PARAM_KEY)
  },

  /**
   * Set Referrer Info in Local Storage from Query String
   */
  setReferrer () {
    this.refType = performStorage(GET, REF.STORAGE.TYPE_KEY)
    this.refCode = performStorage(GET, REF.STORAGE.CODE_KEY)

    // No Referrer Code Found in Local Storage
    if (!this.refType || !this.refCode) {
      this.getRefFromParams()

      // Set Referrer Code in Local Storage for the First Time
      if (this.refType && this.refCode) {
        performStorage(SET, REF.STORAGE.TYPE_KEY, this.refType)
        performStorage(SET, REF.STORAGE.CODE_KEY, this.refCode)
      }
    }
  },

  /**
   * Reset Referrer Info in Local Storage from Query String
   */
  resetReferrer () {
    this.refType = null
    this.refCode = null
    this.getRefFromParams()
    // Set Referrer Code in Local Storage
    performStorage(SET, REF.STORAGE.TYPE_KEY, this.refType || '')
    performStorage(SET, REF.STORAGE.CODE_KEY, this.refCode || '')
  },

  getReferrer () {
    if (!this.refType || !this.refCode) {
      this.setReferrer()
    }

    return {
      key: this.refType,
      val: this.refCode
    }
  },

  getRefFromParams () {
    const inviteCode = getParamByKey(REF.INVITE.PARAM_KEY)
    const referralCode = getParamByKey(REF.REFERRAL.PARAM_KEY)
    if (inviteCode) {
      this.refType = REF.INVITE.INPUT_VALUE
      this.refCode = inviteCode
    } else if (referralCode) {
      this.refType = REF.REFERRAL.INPUT_VALUE
      this.refCode = referralCode
    }

    return {
      key: (inviteCode || referralCode) && this.refType,
      val: inviteCode || referralCode
    }
  },
}

