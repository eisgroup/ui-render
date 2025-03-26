/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const NAME = 'TRACKING' // Namespace this module
/**
 * To opt out of Analytics tracking, visit the site with query string `?i=casper`
 * where 'casper' is EXCLUDED_TRACKING_INVITE_CODE
 */
export const EXCLUDED_TRACKING_INVITE_CODE = 'casper'
export const FIRST_VISIT_TIMESTAMP_KEY = `${NAME}_FIRST_VISIT_TIMESTAMP`
export const COOKIE_ACCEPTED_TIMESTAMP_KEY = `${NAME}_COOKIE_ACCEPTED_TIMESTAMP`
/**
 * User ID can be set using query string with param key as defined below (ex. `?u=USER_ID`)
 */
export const USER = {
  PARAM_KEY: 'u',  // URL query string
  STORAGE_KEY: `${NAME}_USER`,  // used to set `userId` in analytics
}
export const REF = {
  INVITE: {
    PARAM_KEY: 'i',  // URL query string
    INPUT_VALUE: 'invite',  // -> must match HTML input[name="referrer"] values
  },
  REFERRAL: {
    PARAM_KEY: 'r',  // URL query string
    INPUT_VALUE: 'referral',  // -> must match HTML input[name="referrer"] values
  },
  STORAGE: {
    TYPE_KEY: `${NAME}_REFERRER_TYPE`,
    CODE_KEY: `${NAME}_REFERRER_CODE`,  // used to pre-fill HTML input[name="referrer-code"] values
  }
}
