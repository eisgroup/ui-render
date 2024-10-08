import { l } from './constants'
import { localiseTranslation } from './definitions'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * =============================================================================
 */

/**
 * Localised String Object (can be extended by adding new terms or languages)
 * @note: follow the example to ensure only one instance of translation exists.
 * @example:
 *    import { l, localiseTranslation } from 'ui-utils-pack'
 *    export { _ } from 'ui-utils-pack/translations'
 *    localiseTranslation({
 *      NEW_PHRASE: {
 *        [l.ENGLISH]: 'New Phrase',
 *      },
 *    })
 * @usage:
 *    console.log(_.NEW_PHRASE)
 *    >>> 'New Phrase'
 *    console.log(_.THANK_YOU)
 *    >>> 'Thank You!'
 * @returns {Object} localised string - that returns localised 'Untranslated' string if no translation found
 */
export const _ = new Proxy(localiseTranslation.instance, {
  get (target, prop) {
    return localiseTranslation.queriedById[prop] = (target[prop] || target.UNTRANSLATED)
  }
})
localiseTranslation({
  // Default messaged for undefined strings
  UNTRANSLATED: {
    [l.ENGLISH]: 'Untranslated',
    // @Note: only english is provided in the bundle definition
    // All other languages are to be loaded on the fly as static assets,
    // so that they can be cached by the the browser.
  },

  // Actions
  // ---------------------------------------------------------------------------
  ADD: {
    [l.ENGLISH]: 'Add',
  },
  CLICK_HERE: {
    [l.ENGLISH]: 'Click here',
  },
  CONTACT_US: {
    [l.ENGLISH]: 'Contact Us',
  },
  COPY: {
    [l.ENGLISH]: 'Copy',
  },
  COPIED: {
    [l.ENGLISH]: 'Copied',
  },
  NO: {
    [l.ENGLISH]: 'No',
  },
  YES: {
    [l.ENGLISH]: 'Yes',
  },
  OK: {
    [l.ENGLISH]: 'Ok',
  },
  ERROR: {
    [l.ENGLISH]: 'Error',
  },
  ERROR_MESSAGE: {
    [l.ENGLISH]: 'Error Message',
  },
  ERROR_INFO: {
    [l.ENGLISH]: 'Error Info',
  },
  ERROR_STACK: {
    [l.ENGLISH]: 'Error Stack',
  },
  DATA_CAUSING_ERROR: {
    [l.ENGLISH]: 'Data Causing Error',
  },
  CLOSE: {
    [l.ENGLISH]: 'Close',
  },
  OPEN: {
    [l.ENGLISH]: 'Open',
  },
  DELETE: {
    [l.ENGLISH]: 'Delete',
  },
  REMOVE: {
    [l.ENGLISH]: 'Remove',
  },
  BACK: {
    [l.ENGLISH]: 'Back',
  },
  NEXT: {
    [l.ENGLISH]: 'Next',
  },
  NEW: {
    [l.ENGLISH]: 'New',
  },
  LOGIN: {
    [l.ENGLISH]: 'Login',
  },
  LOGIN_noun: {
    [l.ENGLISH]: 'Login',
  },
  LOGOUT: {
    [l.ENGLISH]: 'Logout',
  },
  REGISTER: {
    [l.ENGLISH]: 'Register',
  },
  RESET: {
    [l.ENGLISH]: 'Reset',
  },
  RETRY: {
    [l.ENGLISH]: 'Retry',
  },
  SELECT: {
    [l.ENGLISH]: 'Select',
  },
  SEARCH: {
    [l.ENGLISH]: 'Search',
  },
  SEARCHING___: {
    [l.ENGLISH]: 'Searching...',
  },
  SIGN_IN: {
    [l.ENGLISH]: 'Sign in',
  },
  SIGN_IN_noun: {
    [l.ENGLISH]: 'Sign in',
  },
  SIGNUP: {
    [l.ENGLISH]: 'Signup',
  },
  SIGNUP_noun: {
    [l.ENGLISH]: 'Signup',
  },
  SEND: {
    [l.ENGLISH]: 'Send',
  },
  SUBMIT: {
    [l.ENGLISH]: 'Submit',
  },
  SAVE: {
    [l.ENGLISH]: 'Save',
  },
  SAVED: {
    [l.ENGLISH]: 'Saved',
  },
  SAVE_TO_FAVORITES: {
    [l.ENGLISH]: 'Save to Favorites',
  },
  TYPE_A_MESSAGE: {
    [l.ENGLISH]: 'Type a message',
  },
  HIDE: {
    [l.ENGLISH]: 'Hide',
  },
  SHOW: {
    [l.ENGLISH]: 'Show',
  },
  SHOW_LESS: {
    [l.ENGLISH]: 'Show less',
  },
  READ_MORE: {
    [l.ENGLISH]: 'Read more',
  },

  // Common
  // ---------------------------------------------------------------------------
  BY: {
    [l.ENGLISH]: 'by',
  },
  BETWEEN: {
    [l.ENGLISH]: 'between',
  },
  OR: {
    [l.ENGLISH]: 'or',
  },
  PRIVACY_POLICY: {
    [l.ENGLISH]: 'Privacy Policy',
  },
  YOUR_INFO_IS_SAFE_WITH_US_SEE_OUR: {
    [l.ENGLISH]: 'Your info is safe with us, see our',
  },
  TERMS_OF_SERVICE: {
    [l.ENGLISH]: 'Terms of Service',
  },
  TESTER: {
    [l.ENGLISH]: 'Tester',
  },
  THANK_YOU: {
    [l.ENGLISH]: 'Thank You!',
  },
  WE_HAVE_RECEIVED_YOUR_MESSAGE_AND_WILL_GET_IN_TOUCH_SHORTLY: {
    [l.ENGLISH]: 'We have received your message and will get in touch shortly',
  },
  OUR_SITE_USES_COOKIES_BY_CONTINUING_TO_USE_OUR_SITE_YOU_ARE_AGREEING_TO_OUR: {
    [l.ENGLISH]: 'Our site uses cookies. By continuing to use our site you are agreeing to our',
  },
  OK_I_UNDERSTAND: {
    [l.ENGLISH]: 'OK, I understand',
  },
  PLEASE: {
    [l.ENGLISH]: 'Please',
  },
  USE_ANOTHER_BROWSER_TO: {
    [l.ENGLISH]: 'Use another browser to',
  },
  DONT_SHOW_AGAIN: {
    [l.ENGLISH]: `Don't Show Again`,
  },
  ERROR_ID: {
    [l.ENGLISH]: 'Error ID',
  },
  REASON: {
    [l.ENGLISH]: 'Reason',
  },
  STATUS: {
    [l.ENGLISH]: 'Status',
  },
  REQUEST_FAILED: {
    [l.ENGLISH]: 'Request Failed',
  },
  SERVER_DISCONNECTED: {
    [l.ENGLISH]: 'Server Disconnected',
  },
  DOWNLOAD_FAILED_: {
    [l.ENGLISH]: 'Download Failed!',
  },
  REQUEST_FAILED_FOR_url: {
    [l.ENGLISH]: 'Request failed for {url}',
  },
})
