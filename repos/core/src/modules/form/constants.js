import { CHANGE, ERROR, FINISH, LANGUAGE_LEVEL, START, SUBMIT, SUCCESS } from '../../common/constants'
import { DEFINITION_BY_CODE, OPTIONS, TYPE } from '../../common/variables'
import { FIELD } from '../../components/views/constants'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const NAME = 'form'  // Namespace this module
export const FORM_ASYNC_VALIDATE = 'FORM_ASYNC_VALIDATE'
export const API_VALIDATE_FAIL_CODE = 422
export const ACTION_TYPE = '@@redux-form'
export const FORM_ACTION_TYPE = {
  [CHANGE]: 'CHANGE',
  [SUBMIT]: {
    [START]: `${ACTION_TYPE}/START_SUBMIT`,
    [FINISH]: `${ACTION_TYPE}/STOP_SUBMIT`,
    [SUCCESS]: `${ACTION_TYPE}/SET_SUBMIT_SUCCEEDED`,
    [ERROR]: `${ACTION_TYPE}/SET_SUBMIT_FAILED`
  }
}

// Field Type Definitions
FIELD.TYPE = {
  DROPDOWN: 'Dropdown', // Semantic UI Dropdown
  DATE: 'Date',
  DATES: 'Dates', // multiple date ranges with `from` and `to` times
  INPUT: 'Input', // generic input of different types (i.e. type='text', 'textarea', etc.)
  SLIDER: 'SliderLabel', // slider field with label
  TOGGLE: 'Toggle', // checkbox rendered as toggle button
  GROUP: 'Group', // group of semantically related fields (i.e. pay rate and currency)
  MULTIPLE: 'Fields', // multiple fields of the same type (i.e. mobile/work/home phone numbers)
  MULTIPLE_LEVEL: 'FieldsWithLevel',  // multiple fields of the same type, each having a value in predefined scale
  PLACE: 'Place',  // Google Places Autocomplete
  UPLOAD_GRID: 'UploadGrid',  // multiple uploads in grid layout
}

// Common Field Ids
FIELD.ID = {
  NAME: 'name',
  EMAIL: 'email',
  ABOUT: 'about',
  ADDRESS: 'address',
  LANGUAGE: 'lang',
  PHONE: 'phone',
  ID_HIDDEN: 'idHidden', // default input `name` is `id`
}

// Min/Max Values for Slider Ranges
FIELD.MIN_MAX = {
  [FIELD.ID.LANGUAGE]: [LANGUAGE_LEVEL.BASIC.code, LANGUAGE_LEVEL.NATIVE.code],
}

// Common Field Definitions
FIELD.DEF = {
  [FIELD.ID.ID_HIDDEN]: {
    name: 'id',
    type: 'hidden',
  },
  [FIELD.ID.NAME]: {
    name: 'name',
    label: 'Name',
  },
  [FIELD.ID.ABOUT]: {
    name: 'about',
    label: 'Description',
    hint: 'About me',
    placeholder: 'Enter brief description',
    type: 'textarea',
  },
  [FIELD.ID.ADDRESS]: {
    name: 'place',
    label: 'Address',
    hint: 'My address is',
    placeholder: 'Enter address',
    view: FIELD.TYPE.PLACE
  },
  [FIELD.ID.LANGUAGE]: {
    name: 'lang',
    kind: TYPE.LANGUAGE.key,
    level: DEFINITION_BY_CODE.LANGUAGE_LEVEL,
    options: OPTIONS.LANGUAGE,
    min: FIELD.MIN_MAX[FIELD.ID.LANGUAGE][0],
    max: FIELD.MIN_MAX[FIELD.ID.LANGUAGE][1],
    unit: 'Level',
    hint: 'I speak',
    view: FIELD.TYPE.MULTIPLE_LEVEL,
  },
}

// Field props
export const stickyPlaceholder = true
export const left = true
export const multiple = true
export const required = true
export const search = true
