import { DEFINITION_BY_VAL, ENUM } from 'ui-modules-pack/variables/definitions'
import { definitionByValue, enumFrom, l } from 'ui-utils-pack'

/**
 * LOCALISED DEFINITIONS =======================================================
 * =============================================================================
 */

export const _USER = {
  // @Note: User Authorization can have matching values with User Role, but incrementing in between.
  //    Example: a Supervising Staff may have authorization level 200, while New Hire - level 99.
  //    It is then possible to set access threshold for certain features based on auth level.
  ROLE: {
    // 0: 'Any' - zero value code is used to delete record in database
    // Language is the bottom most in hierarchy because code should be defined only once
    // and it's easier to see all translation of the same word together
    // We use numbered code for security reasons so it's harder for hackers to guess.
    // Numbered code also allows computation of permissions with quick `<` or `>` checks
    USER: {
      _: 0, // default role -> undefined in database
      [l.ENGLISH]: 'User',
      // [l.RUSSIAN]: 'Пользователь',
    },
    STAFF: {
      _: 99,
      [l.ENGLISH]: 'Staff',
      // [l.RUSSIAN]: 'Сотрудник',
    },
    DEVELOPER: {
      _: 699,
      [l.ENGLISH]: 'Developer',
      // [l.RUSSIAN]: 'Девелопер',
    },
    ADMIN: {
      _: 999,
      [l.ENGLISH]: 'Admin',
      // [l.RUSSIAN]: 'Админ',
    },
  },

  KIND: {
    INDIVIDUAL: {
      _: 0,
      [l.ENGLISH]: 'Individual',
      // [l.RUSSIAN]: 'Частное Лицо',
    },
    COMPANY: {
      _: 1,
      [l.ENGLISH]: 'Company',
      // [l.RUSSIAN]: 'Компания',
    },
  },
}

export const SEX = { // code needs to be incrementing value for slider
  ANY: {
    _: 0,
    [l.ENGLISH]: 'Any',
  },
  FEMALE: {
    _: 1,
    [l.ENGLISH]: 'Female',
  },
  MALE: {
    _: 2,
    [l.ENGLISH]: 'Male',
  }
}

DEFINITION_BY_VAL.USER_ROLE = definitionByValue(_USER.ROLE)
DEFINITION_BY_VAL.USER_KIND = definitionByValue(_USER.KIND)
DEFINITION_BY_VAL.SEX = definitionByValue(SEX)
ENUM.USER_ROLE = enumFrom(_USER.ROLE)
ENUM.USER_KIND = enumFrom(_USER.KIND)
ENUM.SEX = enumFrom(SEX)
