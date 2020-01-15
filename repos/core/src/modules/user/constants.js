import { optionsFrom } from '../../common/variables'
import { required, stickyPlaceholder } from '../form/constants'
import { timeInThePast } from '../form/validationRules'
import { SEX, USER } from './definitions'
import { FIELD } from '../../components/views/constants'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const NAME = 'USER' // Namespace this module
export const SELF = `${NAME}_SELF`
export const USER_LOGIN = `${NAME}_LOGIN`
export const USER_SETTINGS = `${NAME}_SETTINGS`

// Field IDs
FIELD.ID = {
  FIRST_NAME: `${NAME}_FIRST_NAME`,
  LAST_NAME: `${NAME}_LAST_NAME`,
  FULL_NAME: `${NAME}_FULL_NAME`,
  BIRTHDAY: `${NAME}_BIRTHDAY`,
  BIRTH_n_SEX: `${NAME}_BIRTH_&_SEX`,
  ROLE: `${NAME}_ROLE`,
  SEX: `${NAME}_SEX`,
}

// Field Definitions
FIELD.DEF = {
  [FIELD.ID.FIRST_NAME]: {
    name: 'name',
    label: 'First Name',
    hint: 'My first name is',
  },
  [FIELD.ID.LAST_NAME]: {
    name: 'surname',
    label: 'Last Name',
    hint: 'My family name is',
  },
  [FIELD.ID.BIRTHDAY]: {
    name: 'birthday',
    label: 'Date of Birth',
    hint: 'I was born on',
    placeholder: 'dd.mm.yyyy',
    stickyPlaceholder,
    validate: [timeInThePast],
    view: FIELD.TYPE.DATE,
  },
  [FIELD.ID.ROLE]: {
    name: 'role',
    label: 'User Role',
    hint: 'Register me as',
    options: optionsFrom([USER.ROLE.CLIENT, USER.ROLE.MODEL]),
    view: FIELD.TYPE.DROPDOWN,
  },
  [FIELD.ID.SEX]: {
    name: 'sex',
    label: 'Gender',
    hint: 'I am',
    options: optionsFrom([SEX.FEMALE, SEX.MALE]),
    view: FIELD.TYPE.DROPDOWN,
  },
  [FIELD.ID.FULL_NAME]: {
    items: [{id: FIELD.ID.FIRST_NAME, required}, {id: FIELD.ID.LAST_NAME, required}],
    view: FIELD.TYPE.GROUP,
  },
  [FIELD.ID.BIRTH_n_SEX]: {
    items: [{id: FIELD.ID.BIRTHDAY, required}, {id: FIELD.ID.SEX, required}],
    view: FIELD.TYPE.GROUP,
  },
}
