import { stickyPlaceholder } from 'modules-pack/form/constants'
import { FIELD, SERVICE } from 'modules-pack/variables'
import { timeInThePast } from 'react-ui-pack/inputs/validationRules'
import { optionsFrom } from 'utils-pack'
import { namespace } from 'utils-pack/utility'
import { _USER, SEX } from './definitions'
import { _ } from './translations'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const USER = 'USER' // Namespace this module
export const USER_CLIENT = namespace(USER, SERVICE.CLIENT) // Namespace this module for frontend
export const SELF = `${USER}_SELF`
export const USER_LOGIN = `${USER}_LOGIN`

// Field IDs
FIELD.ID = {
  GIVEN_NAME: `${USER}_GIVEN_NAME`,
  SURNAME: `${USER}_SURNAME`,
  FULL_NAME: `${USER}_FULL_NAME`,
  BIRTHDAY: `${USER}_BIRTHDAY`,
  BIRTH_n_SEX: `${USER}_BIRTH_&_SEX`,
  ROLE: `${USER}_ROLE`,
  SEX: `${USER}_SEX`,
}

// Lists
FIELD.FOR = {
  /* To be defined on implementation */
  // USER_CONTACTS: [
  //   {id: FIELD.ID.EMAIL, required},
  //   {id: FIELD.ID.PHONE, required},
  //   {id: FIELD.ID.ADDRESS},
  // ],
  // USER_PROFILE: [
  //   {id: FIELD.ID.FULL_NAME},
  //   {id: FIELD.ID.BIRTH_n_SEX},
  // ],
}

// Field Definitions
FIELD.DEF = {
  [FIELD.ID.GIVEN_NAME]: {
    name: 'name',
    get label () {return _.GIVEN_NAME},
    get hint () {return _.MY_GIVEN_NAME_IS},
    view: FIELD.TYPE.INPUT,
  },
  [FIELD.ID.SURNAME]: {
    name: 'surname',
    get label () {return _.SURNAME},
    get hint () {return _.MY_SURNAME_IS},
    view: FIELD.TYPE.INPUT,
  },
  [FIELD.ID.ABOUT_ME]: {
    name: 'about',
    get label () {return _.ABOUT_ME},
    get hint () {return _.ABOUT_ME},
    get placeholder () {return _.BRIEF_DESCRIPTION},
    type: 'textarea',
    view: FIELD.TYPE.INPUT,
  },
  [FIELD.ID.BIRTHDAY]: {
    name: 'birthday',
    get label () {return _.DATE_OF_BIRTH},
    get hint () {return _.I_WAS_BORN},
    placeholder: 'dd.mm.yyyy',
    stickyPlaceholder,
    validate: [timeInThePast],
    view: FIELD.TYPE.DATE,
  },
  [FIELD.ID.ROLE]: {
    name: 'role',
    get label () {return _.MY_ROLE},
    get hint () {return _.REGISTER_ME_AS},
    options: optionsFrom([_USER.ROLE.STAFF, _USER.ROLE.USER]),
    view: FIELD.TYPE.DROPDOWN,
  },
  [FIELD.ID.SEX]: {
    name: 'sex',
    get label () {return _.GENDER},
    get hint () {return _.I_AM},
    options: optionsFrom([SEX.FEMALE, SEX.MALE]),
    view: FIELD.TYPE.DROPDOWN,
    // Cannot use minWidth because it causes overflow for long text, add minWidth for FormInSteps only
    // style: {minWidth: 120},
  },
  [FIELD.ID.FULL_NAME]: {
    // `required` can be passed down as group, leave undefined by default for customisation
    items: [{id: FIELD.ID.GIVEN_NAME}, {id: FIELD.ID.SURNAME}],
    view: FIELD.TYPE.GROUP,
  },
  [FIELD.ID.BIRTH_n_SEX]: {
    items: [{id: FIELD.ID.BIRTHDAY}, {id: FIELD.ID.SEX}],
    view: FIELD.TYPE.GROUP,
  },
}
