import { ACTIVE, definitionByValue, enumFrom, l, LANGUAGE, LANGUAGE_LEVEL, optionsFrom } from 'utils-pack'

/**
 * PROJECT DEFINITIONS =========================================================
 * =============================================================================
 */

export const CURRENCY = {
  USD: {
    _: 'USD',
    [l.ENGLISH._]: 'USD',
  },
  RUB: {
    _: 'RUB',
    [l.ENGLISH._]: 'RUB',
  },
}
ACTIVE.CURRENCY = CURRENCY.USD

export const PHONE = {
  MOBILE: {
    _: 'mobile',
    [l.ENGLISH._]: 'Mobile Phone'
  },
  HOME: {
    _: 'home',
    [l.ENGLISH._]: 'Home Phone'
  },
  WORK: {
    _: 'work',
    [l.ENGLISH._]: 'Work Phone'
  },
}

export const TYPE = {
  LANGUAGE: {
    _: 'lang',
    [l.ENGLISH._]: 'Language'
  },
  LANGUAGE_LEVEL: {
    _: 'langLevel',
    [l.ENGLISH._]: 'Language Level'
  },
  PHONE: {
    _: 'phones',
    [l.ENGLISH._]: 'Phone'
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

export const DEFINITION_BY_CODE = {
  LANGUAGE: definitionByValue(LANGUAGE),
  LANGUAGE_LEVEL: definitionByValue(LANGUAGE_LEVEL),
  [TYPE.LANGUAGE._]: definitionByValue(LANGUAGE),
}

export const ENUM = {
  LANGUAGE: enumFrom(LANGUAGE),
  LANGUAGE_LEVEL: enumFrom(LANGUAGE_LEVEL),
}
