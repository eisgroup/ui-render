import { Active, definitionByValue, enumFrom, l, LANGUAGE, LANGUAGE_LEVEL, optionsFrom } from 'utils-pack'

/**
 * PROJECT DEFINITIONS =========================================================
 * =============================================================================
 */

export const CURRENCY = {
  USD: {
    _: 'USD',
    [l.ENGLISH]: 'USD',
  },
  RUB: {
    _: 'RUB',
    [l.ENGLISH]: 'RUB',
  },
}
Active.CURRENCY = CURRENCY.USD

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
    [l.ENGLISH]: 'Phone'
  },
}
export const TYPE_BY = {
  [TYPE.LANGUAGE._]: TYPE.LANGUAGE,
  [TYPE.PHONE._]: TYPE.PHONE,
}

export const OPTIONS = {
  CURRENCY: optionsFrom(CURRENCY),
  PHONE: optionsFrom(PHONE),
}

export const DEFINITION = {
  [TYPE.LANGUAGE._]: LANGUAGE,
  [TYPE.PHONE._]: PHONE,
}

export const DEFINITION_BY_VAL = {
  LANGUAGE: definitionByValue(LANGUAGE),
  LANGUAGE_LEVEL: definitionByValue(LANGUAGE_LEVEL),
  [TYPE.LANGUAGE._]: definitionByValue(LANGUAGE),
}

export const ENUM = {
  LANGUAGE: enumFrom(LANGUAGE),
  LANGUAGE_LEVEL: enumFrom(LANGUAGE_LEVEL),
}
