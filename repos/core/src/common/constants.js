/**
 * COMMON ACTION CONSTANTS =====================================================
 * =============================================================================
 */
export const SEPARATOR =      ' -> '          // ACTION type separator string
export const RESULT_SEPARATOR = '_'           // RESULT type separator string
export const SYSTEM =       'SYSTEM'          // Internal app action subject

/* CRUD Actions */
export const GET =          'GET'             // Retrieving data
export const CREATE =       'CREATE'          // Posting new data to backend
export const UPDATE =       'UPDATE'          // For saving remote API data (e.g. syncing with backend)
export const DELETE =       'DELETE'          // Destroying data from backend
export const LIST =         'LIST'            // Retrieving list of data

/* State Only Actions */
export const SET =          'SET'             // For saving non-API data in state
export const RESET =        'RESET'
export const HYDRATE =      'HYDRATE'         // For Hydrating Redux Store
export const LOGIN =        'LOGIN'
export const LOGOUT =       'LOGOUT'
export const LOAD =         'LOAD'
export const ALERT =        'ALERT'           // For broadcasting a resource
export const SAVE =         'SAVE'            // For triggering persistence of a resource
export const EDIT =         'EDIT'
export const OPEN =         'OPEN'
export const CLOSE =        'CLOSE'
export const SEARCH =       'SEARCH'          // For searching for a resource
export const SUBMIT =       'SUBMIT'          // For triggering submission of a resource
export const ADD =          'ADD'             // For adding a resource
export const CHANGE =       'CHANGE'          // For changing state
export const REMOVE =       'REMOVE'          // For removing state
export const REPORT =       'REPORT'       // For broadcasting a resource

/* App Specific Actions */

/* Action Result Types */
export const START =        'START'
export const CANCEL =       'CANCEL'
export const FINISH =       'FINISH'
export const RECEIVED =     'RECEIVED'
export const VOID =         'VOID'            // No response at all

/* Socket Actions */
export const SEND =         'SEND'
export const SUBSCRIBE =    'SUBSCRIBE'
export const UNSUBSCRIBE =  'UNSUBSCRIBE'

/* Socket Network Action Result Types */
export const CONNECTED =    'CONNECTED'
export const DISCONNECTED = 'DISCONNECTED'
export const MESSAGE =      'MESSAGE'

/* API Network Action Result Types */
export const REQUEST =      'REQUEST'
export const SUCCESS =      'SUCCESS'
export const ERROR =        'ERROR'
export const TIMEOUT =      'TIMEOUT'

export const ALL_ACTIONS = [
  MESSAGE,
  GET,
  CREATE,
  UPDATE,
  DELETE,
  LIST,
  SET,
  RESET,
  HYDRATE,
  EDIT,
  LOGIN,
  LOGOUT,
  LOAD,
  SAVE,
  CLOSE,
  OPEN,
  SUBMIT,
  SEARCH,
  ADD,
  ALERT,
  CHANGE,
  REMOVE,
  REPORT,
]

export const ALL_RESULTS = [
  START,
  CANCEL,
  FINISH,
  REQUEST,
  SUCCESS,
  ERROR,
  TIMEOUT,
  RECEIVED,
  VOID
]

/* Distance */
export const ONE_MM =                 1
export const ONE_CM =                 ONE_MM * 100
export const ONE_METER =              ONE_MM * 1000
export const ONE_KM =                 ONE_METER * 1000

/* Formats */
export const FORMAT_TIME =            'YYYY-MM-DD hh:mm:ss'
export const FORMAT_TIME_FOR_HUMAN =  'ddd, Do MMM - hh:mm a'
export const FORMAT_DATE =            'DD.MM.YYYY'
export const FORMAT_DATE_ISO =        'YYYY-MM-DD'
export const FORMAT_HH_MM =           'HH[:]mm'
export const FORMAT_DD_MMM =          'D MMM'
export const FORMAT_DD_MMM_YYYY =     'D MMM, YYYY'
export const FORMAT_MMM_YYYY =        'MMM YYYY'

/* Placeholders */
export const ID = '{ID}'

/* Size */
export const SIZE_KB =          1024
export const SIZE_MB =          SIZE_KB * 1024
export const SIZE_MB_2 =        SIZE_MB * 2
export const SIZE_MB_16 =       SIZE_MB * 16

/* Time */
export const NOW = Date.now()
export const HALF_SECOND =      500
export const HALF_MINUTE =      HALF_SECOND * 60
export const HALF_HOUR =        HALF_MINUTE * 60
export const ONE_SECOND =       1000
export const ONE_MINUTE =       ONE_SECOND * 60
export const ONE_HALF_SECONDS = 1500
export const ONE_HOUR =         ONE_MINUTE * 60
export const ONE_DAY =          ONE_HOUR * 24
export const ONE_WEEK =         ONE_DAY * 7
export const ONE_MONTH =        ONE_DAY * 30
export const ONE_YEAR =         ONE_DAY * 365
export const TWO_SECONDS =      ONE_SECOND * 2
export const TWO_MINUTES =      ONE_MINUTE * 2
export const TWO_DAYS =         ONE_DAY * 2
export const TWO_WEEKS =        ONE_WEEK * 2
export const TWO_MONTHS =       ONE_MONTH * 2
export const THREE_SECONDS =    ONE_SECOND * 3
export const THREE_MINUTES =    ONE_MINUTE * 3
export const FIVE_SECONDS =     ONE_SECOND * 5
export const FIVE_MINUTES =     ONE_MINUTE * 5
export const FIVE_HOURS =       ONE_HOUR * 5
export const SEVEN_SECONDS =    ONE_SECOND * 7
export const SEVEN_MINUTES =    ONE_MINUTE * 7
export const TEN_SECONDS =      ONE_SECOND * 10
export const TEN_MINUTES =      ONE_MINUTE * 10
export const THIRTY_SECONDS =   ONE_SECOND * 30
export const THIRTY_MINUTES =   ONE_MINUTE * 30
export const FIFTEEN_MINUTES =  ONE_MINUTE * 15
export const FORTY_SECONDS =    ONE_SECOND * 40
export const HUNDRED_SECONDS =  ONE_SECOND * 100
export const HUNDRED_MINUTES =  ONE_MINUTE * 100

/* Mappings */
export const CRYPTO = {         // mapped for cryptoSign() and cryptoHash()
  HMAC_SHA256: 'sha256',
  HMAC_SHA384: 'sha384',
  HMAC_SHA512: 'sha512',
  MD5: 'md5',
}
export const LANGUAGE = { // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
  // @note: sync with Google standard https://developers.google.com/maps/faq#languagesupport
  ENGLISH: {code: 'en', lang: 'English', 'en': 'English'},
  RUSSIAN: {code: 'ru', lang: 'Русский', 'en': 'Russian'},
  CHINESE: {code: 'zh', lang: '中文', 'en': 'Mandarin Chinese'},
  CANTONESE: {code: 'zh-HK', lang: '廣東話', 'en': 'Cantonese Chinese'},
  SPANISH: {code: 'es', lang: 'Español', 'en': 'Spanish'},
  ITALIAN: {code: 'it', lang: 'Italiano', 'en': 'Italian'},
  PORTUGUESE: {code: 'pt', lang: 'Português', 'en': 'Portuguese'},
  GERMAN: {code: 'de', lang: 'Deutsch', 'en': 'German'},
  DUTCH: {code: 'nl', lang: 'Nederlands', 'en': 'Dutch'},
  FRENCH: {code: 'fr', lang: 'Français', 'en': 'French'},
  SWEDISH: {code: 'sv', lang: 'Svenska', 'en': 'Swedish'},
  FINNISH: {code: 'fi', lang: 'Suomi', 'en': 'Finnish'},
  GREEK: {code: 'el', lang: 'Ελληνικά', 'en': 'Greek'},
  HEBREW: {code: 'he', lang: 'עִבְרִית', 'en': 'Hebrew'},
  YIDDISH: {code: 'yi', lang: 'ייִדיש', 'en': 'Yiddish'},
  PERSIAN: {code: 'fa', lang: 'فارسی', 'en': 'Persian'},
  ARABIC: {code: 'ar', lang: 'العَرَبِيَّة‎', 'en': 'Arabic'},
  AFRIKAANS: {code: 'af', lang: 'Afrikaans', 'en': 'Afrikaans'},
  KOREAN: {code: 'ko', lang: '한국어', 'en': 'Korean'},
  JAPANESE: {code: 'ja', lang: '日本語', 'en': 'Japanese'},
}
export const LANGUAGE_LEVEL = {
  UNKNOWN: {
    code: 0,
    [LANGUAGE.ENGLISH.code]: 'Unknown'
  },
  BASIC: {
    code: 1,
    [LANGUAGE.ENGLISH.code]: 'Beginner'
  },
  WORKING: {
    code: 2,
    [LANGUAGE.ENGLISH.code]: 'Working'
  },
  PROFICIENT: {
    code: 3,
    [LANGUAGE.ENGLISH.code]: 'Proficient'
  },
  FLUENT: {
    code: 4,
    [LANGUAGE.ENGLISH.code]: 'Fluent'
  },
  NATIVE: {
    code: 5,
    [LANGUAGE.ENGLISH.code]: 'Native'
  },
}

/* Characters */
export const PLUS = '✛'
export const MINUS = '╍'
export const DOT = '•'
export const CROSS = '✕'
export const CROSSMARK = '❌'
export const CHECK = '✓'
export const CHECKBOX = '✅'
export const CLOVER = '☘'
export const RECYCLE = '♻️'
export const HEART = '♥'
export const HEART_EXCLAMATION = '❣'
export const SPARKLES = '✨'
export const THUNDER = '⚡'
export const FIREWORK = '💥'
export const ROCKET = '🚀'
export const BLOCK = '🚷'
export const CHICKEN = '🐣'
export const SKULL = '☠'
export const WARN = '✋'
export const WORKER = '👷'

/*
 * Special Characters Reference for Documentation Use
 * ┌───┬───────────────────────────────────────────────────────────────────────┐
 * │ 1 │     ╭ ─ ╮                                                             │
 * │   │     │ 5 │                                                             │
 * │ 2 │     ╰ ─ ╯                                                             │
 * ├───┼───────────────────────────────────────────────────────────────────────┤
 * │ 3 │                                                                       │
 * └───┴───────────────────────────────────────────────────────────────────────┘
 *     ├─┬─> A ⟶ B
 *     │ ├─> A ⟵ B
 *     │ └─> C ⟶ B
 *     │
 *     └─┬─> C ⟶ D
 *       └─> C ⟵ D
 *                               Time
 *                                │
 *    Start someFunctionName() -> ├───> Action A (start) ─────┐
 *                                ├───> Action B (start) ───────┐
 *                                │                           │ │
 *     Call someFunctionName() -> │╭ ──── Action A (end) ─────┘ │
 *     (dispatch new actions)     │╰ ─> Action C (start) ──────────┐
 *                                │                             │  │
 *                                │                             │  │
 *     Call someFunctionName() -> │╭ ── Action D <─ User Input  │  │
 *     (dispatch new actions)     │╰ ─> Action E (start) ─────────────┐
 *                                │                             │  │  │
 *                                │                             │  │  │
 *     Call someFunctionName() -> │  <─── Action B (end) ───────┘  │  │
 *   (no more actions, wait...)   │  <─── Action C (end) ──────────┘  │
 *                                │                                   │
 *      End someFunctionName() -> │  <─── Action E (end) ─────────────┘
 *                                │
*/
