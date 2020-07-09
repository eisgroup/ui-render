import { DEFAULT } from 'modules-pack/variables/defaults'
import { DEFINITION_BY_VAL, ENUM } from 'modules-pack/variables/definitions'
import { definitionByValue, enumFrom, LANGUAGE } from 'utils-pack'

/**
 * LOCALISED DEFINITIONS =======================================================
 * =============================================================================
 */


export const USER = {
  TYPE: {
    // 0: 'Any' - zero value code is used to delete record in database
    // Language is the bottom most in hierarchy because code should be defined only once
    // and it's easier to see all translation of the same word together
    COMPANY: {
      _: 'c',
      [LANGUAGE.ENGLISH._]: 'Company'
    },
    FREELANCER: {
      _: 'i',
      [LANGUAGE.ENGLISH._]: 'Freelancer'
    },
  },

  ROLE: {
    // We use numbered code for security reasons so it's harder for hackers to guess.
    // Numbered code also allows computation of permissions with quick `<` or `>` checks
    ADMIN: {
      _: 999,
      [LANGUAGE.ENGLISH._]: 'Admin'
    },
    STAFF: {
      _: 99,
      [LANGUAGE.ENGLISH._]: 'Staff'
    },
  },

  ACTION: {},
}

export const SEX = { // code needs to be incrementing value for slider
  ANY: {
    _: 0,
    [LANGUAGE.ENGLISH._]: 'Any',
  },
  FEMALE: {
    _: 1,
    [LANGUAGE.ENGLISH._]: 'Female',
  },
  MALE: {
    _: 2,
    [LANGUAGE.ENGLISH._]: 'Male',
  }
}

export const PERMISSION = {
  // @note: permissions are defined as separate access levels.
  // To have full access, one must have all permissions defined below.
  // This way we keep the logic for checking permissions simple.
  // Example: User with permission {'1': true, '99': true} cannot update/delete.
  READ: {
    _: 1,
    [LANGUAGE.ENGLISH._]: 'Read',
  },
  UPDATE: {
    _: 2,
    [LANGUAGE.ENGLISH._]: 'Update',
  },
  DELETE: {
    _: 3,
    [LANGUAGE.ENGLISH._]: 'Delete',
  },
  MANAGE_USERS: { // add/remove users and set permissions
    _: 99, // same as STAFF authorization level
    [LANGUAGE.ENGLISH._]: 'Manage Users',
  },
}

DEFAULT.SEX = SEX.FEMALE.code
DEFINITION_BY_VAL.USER_ROLE = definitionByValue(USER.ROLE)
DEFINITION_BY_VAL.USER_TYPE = definitionByValue(USER.TYPE)
DEFINITION_BY_VAL.SEX = definitionByValue(SEX)
ENUM.USER_ROLE = enumFrom(USER.ROLE)
ENUM.USER_TYPE = enumFrom(USER.TYPE)
ENUM.SEX = enumFrom(SEX)
