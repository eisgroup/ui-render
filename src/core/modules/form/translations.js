import { l, localiseTranslation } from 'ui-utils-pack'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * @example:
 *    import * as t from 'ui-modules-pack/form/translations'
 *    const sideEffects = {t} // prevent webpack tree shaking in prod
 * =============================================================================
 */
localiseTranslation({
  EMAIL: {
    [l.ENGLISH]: 'Email',
  },
  EXAMPLE_GMAIL_COM: {
    [l.ENGLISH]: 'example@gmail.com',
  },
  MY_EMAIL_ADDRESS_IS: {
    [l.ENGLISH]: 'My email address is',
  },
  MY_PHONE_NUMBER_IS: {
    [l.ENGLISH]: 'My phone number is',
  },
  PASSWORD: {
    [l.ENGLISH]: 'Password',
  },
  PASSWORD_IS_TOO_WEAK_SHOULD_BE_AT_LEAST_8_CHARACTERS_LONG_WITH_SYMBOL_NUMBER_UPPER_AND_LOWER_CASE_LETTERS: {
    [l.ENGLISH]: 'Password is too weak! Should be at least 8 characters long, with symbol, number, upper and lower case letters',
  },
  CONFIRM_PASSWORD: {
    [l.ENGLISH]: 'Confirm Password',
  },
  PLEASE_ENTER_A_VALID_EMAIL_ADDRESS: {
    [l.ENGLISH]: 'Please enter a valid email address',
  },
  PLEASE_COMPLETE_: {
    [l.ENGLISH]: 'Please complete:',
  },
  plus_1_555_555_55_55: {
    [l.ENGLISH]: '+1 555-555-5555',
  },
  plus_ADD_type: {
    [l.ENGLISH]: '+ Add {type}',
  }
})
