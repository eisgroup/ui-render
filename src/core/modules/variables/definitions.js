import { enumFrom, l, LANGUAGE, LANGUAGE_LEVEL, optionsFrom } from 'ui-utils-pack'

/**
 * PROJECT DEFINITIONS =========================================================
 * =============================================================================
 */

export const CURRENCY = {
  USD: {
    _: 'USD',
    [l.ENGLISH]: 'USD',
  },
  EUR: {
    _: 'EUR',
    [l.ENGLISH]: 'EUR',
  },
}

export const PHONE = {
  MOBILE: {
    _: 'mobile',
    [l.ENGLISH]: 'Mobile Phone'
  },
  HOME: {
    _: 'home',
    [l.ENGLISH]: 'Home Phone'
  },
  WORK: {
    _: 'work',
    [l.ENGLISH]: 'Work Phone'
  },
}

/* Match with GraphQL Type */
export const TYPE = {
  CURRENCY: {
    _: 'Currency',
    [l.ENGLISH]: 'Currency'
  },
  LANGUAGE: {
    _: 'Language',
    [l.ENGLISH]: 'Language'
  },
  LANGUAGE_LEVEL: {
    _: 'LanguageLevel',
    [l.ENGLISH]: 'Language Level'
  },
  PHONE: {
    _: 'Phone',
    [l.ENGLISH]: 'Phone Number'
  },
}

export const OPTIONS = {
  CURRENCY: optionsFrom(CURRENCY),
  LANGUAGE: optionsFrom(LANGUAGE),
  PHONE: optionsFrom(PHONE),
}

export const DEFINITION = {
  [TYPE.CURRENCY._]: CURRENCY,
  [TYPE.LANGUAGE._]: LANGUAGE,
  [TYPE.PHONE._]: PHONE,
}

export const ENUM = {
  LANGUAGE: enumFrom(LANGUAGE),
  LANGUAGE_LEVEL: enumFrom(LANGUAGE_LEVEL),
}
