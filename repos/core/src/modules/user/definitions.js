import { LANGUAGE } from '../../common/constants'
import { DEFAULT } from '../../common/variables/defaults'
import { DEFINITION_BY_CODE, definitionByCode, ENUM, enumFrom } from '../../common/variables/definitions'

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
      code: 'c',
      [LANGUAGE.ENGLISH.code]: 'Company'
    },
    FREELANCER: {
      code: 'i',
      [LANGUAGE.ENGLISH.code]: 'Freelancer'
    },
  },

  ROLE: {
    // We use numbered code for security reasons so it's harder for hackers to guess.
    // Numbered code also allows computation of permissions with quick `<` or `>` checks
    ADMIN: {
      code: 999,
      [LANGUAGE.ENGLISH.code]: 'Admin'
    },
    STAFF: {
      code: 99,
      [LANGUAGE.ENGLISH.code]: 'Staff'
    },
  },

  ACTION: {},
}

export const SEX = { // code needs to be incrementing value for slider
  ANY: {
    code: 0,
    [LANGUAGE.ENGLISH.code]: 'Any',
  },
  FEMALE: {
    code: 1,
    [LANGUAGE.ENGLISH.code]: 'Female',
  },
  MALE: {
    code: 2,
    [LANGUAGE.ENGLISH.code]: 'Male',
  }
}

export const PERMISSION = {
  // @note: permissions are defined as separate access levels.
  // To have full access, one must have all permissions defined below.
  // This way we keep the logic for checking permissions simple.
  // Example: User with permission {'1': true, '99': true} cannot update/delete.
  READ: {
    code: 1,
    [LANGUAGE.ENGLISH.code]: 'Read',
  },
  UPDATE: {
    code: 2,
    [LANGUAGE.ENGLISH.code]: 'Update',
  },
  DELETE: {
    code: 3,
    [LANGUAGE.ENGLISH.code]: 'Delete',
  },
  MANAGE_USERS: { // add/remove users and set permissions
    code: 99, // same as STAFF authorization level
    [LANGUAGE.ENGLISH.code]: 'Manage Users',
  },
}

DEFAULT.SEX = SEX.FEMALE.code
DEFINITION_BY_CODE.USER_ROLE = definitionByCode(USER.ROLE)
DEFINITION_BY_CODE.USER_TYPE = definitionByCode(USER.TYPE)
DEFINITION_BY_CODE.SEX = definitionByCode(SEX)
ENUM.USER_ROLE = enumFrom(USER.ROLE)
ENUM.USER_TYPE = enumFrom(USER.TYPE)
ENUM.SEX = enumFrom(SEX)
