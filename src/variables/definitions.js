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
  EUR: {
    _: 'EUR',
    [l.ENGLISH]: 'EUR',
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

export const PERMISSION = {
  // @note: permissions are defined as separate access levels.
  // To have full access, one must have all permissions defined below.
  // This way we keep the logic for checking permissions simple.
  // Example: User with permission {'1': true, '99': true} cannot update/delete.
  READ: {
    _: 1,
    [l.ENGLISH]: 'Read',
    // [l.RUSSIAN]: 'Читать',
  },
  UPDATE: {
    _: 2,
    [l.ENGLISH]: 'Update',
    // [l.RUSSIAN]: 'Обновить',
  },
  DELETE: {
    _: 3,
    [l.ENGLISH]: 'Delete',
    // [l.RUSSIAN]: 'Удалить',
  },
  MANAGE_USERS: { // add/remove users and set permissions
    _: 99, // same as STAFF authorization level
    [l.ENGLISH]: 'Manage Users',
    // [l.RUSSIAN]: 'Организовать Пользователей',
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
