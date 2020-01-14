import { optionsFrom } from '../../common/variables'
import { FIELD_RENDER, FIELD_EMAIL, required, stickyPlaceholder, FIELD_PHONE, FIELD_ADDRESS } from '../form/constants'
import { timeInThePast } from '../form/validationRules'
import { SEX, USER } from './definitions'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const NAME = 'USER' // Namespace this module
export const SELF = `${NAME}_SELF`
export const USER_LOGIN = `${NAME}_LOGIN`
export const USER_SETTINGS = `${NAME}_SETTINGS`

/* Form Input Definitions */
export const FIELD_FIRST_NAME = 'First Name'
export const FIELD_LAST_NAME = 'Last Name'
export const FIELD_FULL_NAME = 'Full Name'
export const FIELD_BIRTHDAY = 'Date of Birth'
export const FIELD_BIRTH_SEX = 'Birthday & Sex'
export const FIELD_ROLE = 'Role'
export const FIELD_SEX = 'Gender'
export const FIELDS_FOR_USER_CONTACTS = [
  {id: FIELD_EMAIL, required},
  {id: FIELD_PHONE, required},
  {id: FIELD_ADDRESS},
]
export const FIELDS_FOR_USER_PROFILE = [
  {id: FIELD_FULL_NAME},
  {id: FIELD_BIRTH_SEX},
]
export const FIELDS_FOR_USER_ONBOARDING= [ // base profile info required from all Users
  {id: FIELD_EMAIL, required},
  {id: FIELD_PHONE, required},
  {id: FIELD_ROLE, required},
  {id: FIELD_SEX, required},
  {id: FIELD_FIRST_NAME, required},
  {id: FIELD_LAST_NAME, required},
  {id: FIELD_BIRTHDAY, required},
]
export const USER_FIELD = {
  [FIELD_FIRST_NAME]: {
    name: 'name',
    label: FIELD_FIRST_NAME,
    hint: 'My first name is',
  },
  [FIELD_LAST_NAME]: {
    name: 'surname',
    label: FIELD_LAST_NAME,
    hint: 'My family name is',
  },
  [FIELD_BIRTHDAY]: {
    name: 'birthday',
    label: FIELD_BIRTHDAY,
    hint: 'I was born on',
    placeholder: 'dd.mm.yyyy',
    stickyPlaceholder,
    validate: [timeInThePast],
    renderer: FIELD_RENDER.DATE,
  },
  [FIELD_ROLE]: {
    name: 'role',
    label: FIELD_ROLE,
    hint: 'Register me as',
    options: optionsFrom([USER.ROLE.CLIENT, USER.ROLE.MODEL]),
    renderer: FIELD_RENDER.DROPDOWN,
  },
  [FIELD_SEX]: {
    name: 'sex',
    label: FIELD_SEX,
    hint: 'I am',
    options: optionsFrom([SEX.FEMALE, SEX.MALE]),
    renderer: FIELD_RENDER.DROPDOWN,
  },
  [FIELD_FULL_NAME]: {
    items: [{id: FIELD_FIRST_NAME, required}, {id: FIELD_LAST_NAME, required}],
    renderer: FIELD_RENDER.GROUP,
  },
  [FIELD_BIRTH_SEX]: {
    items: [{id: FIELD_BIRTHDAY, required}, {id: FIELD_SEX, required}],
    renderer: FIELD_RENDER.GROUP,
  },
}
