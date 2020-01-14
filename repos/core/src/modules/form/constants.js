import { CHANGE, ERROR, FINISH, LANGUAGE_LEVEL, START, SUBMIT, SUCCESS } from '../../common/constants'

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
export const FIELD_RENDER = {
  COLLAPSE: 'Collapse',
  DROPDOWN: 'Dropdown',
  DATE: 'Date',
  DATES: 'Dates',
  INPUT: 'Input',
  SLIDER: 'SliderLabel',
  TOGGLE: 'Toggle',
  GROUP: 'Group', // group of semantically related fields (i.e. pay rate and currency)
  MULTIPLE: 'Fields', // multiple fields of the same type (i.e. mobile/work/home phone numbers)
  MULTIPLE_LEVEL: 'FieldsWithLevel',  // multiple fields of the same type, each having a value in predefined scale
  PLACE: 'Place',  // Google Places Autocomplete
  UPLOAD_GRID: 'UploadGrid',  // multiple uploads in grid layout
}

// Field props
export const stickyPlaceholder = true
export const left = true
export const multiple = true
export const required = true
export const search = true

// Common Field Names
export const FIELD_ID_HIDDEN = 'ID_HIDDEN'
export const FIELD_NAME = 'Name'
export const FIELD_EMAIL = 'Email'
export const FIELD_ABOUT = 'Description'
export const FIELD_ADDRESS = 'Address'
export const FIELD_LANGUAGE = 'Language Spoken'
export const FIELD_PHONE = 'Phone Number'

// Min/Max Values for Slider Ranges
export const SLIDER_MIN_MAX = {
  [FIELD_LANGUAGE]: [LANGUAGE_LEVEL.BASIC.code, LANGUAGE_LEVEL.NATIVE.code],
}
