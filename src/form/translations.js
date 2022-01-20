import { l, localiseTranslation } from 'utils-pack'

/**
 * LOCALISED TRANSLATIONS (i18n) ===============================================
 * @example:
 *    import * as t from 'modules-pack/form/translations'
 *    const sideEffects = {t} // prevent webpack tree shaking in prod
 * =============================================================================
 */
localiseTranslation({
  EMAIL: {
    [l.ENGLISH]: 'Email',
    // [l.RUSSIAN]: 'Email',
  },
  EXAMPLE_GMAIL_COM: {
    [l.ENGLISH]: 'example@gmail.com',
    // [l.RUSSIAN]: 'example@gmail.com',
  },
  MY_EMAIL_ADDRESS_IS: {
    [l.ENGLISH]: 'My email address is',
    // [l.RUSSIAN]: 'Мой еmail',
  },
  MY_PHONE_NUMBER_IS: {
    [l.ENGLISH]: 'My phone number is',
    // [l.RUSSIAN]: 'Мой номер телефона',
  },
  PASSWORD: {
    [l.ENGLISH]: 'Password',
    // [l.RUSSIAN]: 'Пароль',
  },
  PASSWORD_IS_TOO_WEAK_SHOULD_BE_AT_LEAST_8_CHARACTERS_LONG_WITH_SYMBOL_NUMBER_UPPER_AND_LOWER_CASE_LETTERS: {
    [l.ENGLISH]: 'Password is too weak! Should be at least 8 characters long, with symbol, number, upper and lower case letters',
    // [l.RUSSIAN]: 'Пароль слишком слабый! Должно быть длина не менее 8 символов, с символом, числом, заглавными и строчными буквами',
  },
  CONFIRM_PASSWORD: {
    [l.ENGLISH]: 'Confirm Password',
    // [l.RUSSIAN]: 'Подтвердите пароль',
  },
  PLEASE_ENTER_A_VALID_EMAIL_ADDRESS: {
    [l.ENGLISH]: 'Please enter a valid email address',
    // [l.RUSSIAN]: 'Пожалуйста ведите верный адрес',
  },
  PLEASE_COMPLETE_: {
    [l.ENGLISH]: 'Please complete:',
    // [l.RUSSIAN]: 'Заполните, пожалуйста:',
  },
  plus_1_555_555_55_55: {
    [l.ENGLISH]: '+1 555-555-5555',
    // [l.RUSSIAN]: '+7 (555) 555-55-55',
  },
  plus_ADD_type: {
    [l.ENGLISH]: '+ Add {type}',
  }
})
