import { FIELD } from 'modules-pack/variables/fields'
import { date, double5, hourMinute, integer, phone, uppercase } from 'react-ui-pack/inputs/normalizers'
import { email, isRequired, maxLength, password, url } from 'react-ui-pack/inputs/validationRules'
import { CHANGE, ERROR, FINISH, START, SUBMIT, SUCCESS } from 'utils-pack'

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

// Validation Definitions
FIELD.NORMALIZE = {
  DATE: 'date',
  HOUR_MINUTE: 'hh:mm',
  DOUBLE5: 'double5',
  INTEGER: 'integer',
  PHONE: 'phone',
  UPPERCASE: 'uppercase',
}
FIELD.NORMALIZER = {
  [FIELD.NORMALIZE.DATE]: date,
  [FIELD.NORMALIZE.HOUR_MINUTE]: hourMinute,
  [FIELD.NORMALIZE.DOUBLE5]: double5,
  [FIELD.NORMALIZE.INTEGER]: integer,
  [FIELD.NORMALIZE.PHONE]: phone,
  [FIELD.NORMALIZE.UPPERCASE]: uppercase,
}

// Validation Definitions
FIELD.VALIDATE = {
  EMAIL: 'email',
  MAX_LENGTH: 'maxLength',
  PASSWORD: 'password',
  REQUIRED: 'required',
  URL: 'url',
}
FIELD.VALIDATION = {
  [FIELD.VALIDATE.EMAIL]: email,
  [FIELD.VALIDATE.MAX_LENGTH]: maxLength,
  [FIELD.VALIDATE.PASSWORD]: password,
  [FIELD.VALIDATE.REQUIRED]: isRequired,
  [FIELD.VALIDATE.URL]: url,
}

// Field props
export const stickyPlaceholder = true
export const lefty = true
export const disabled = true
export const readonly = true
export const multiple = true
export const required = true
export const search = true

/**
 * Populate List of Field Definition with Slider Field required props
 *
 * @param {Array<Object>} fields - list of fields to create, requires FIELD.ID, used for extending base definition
 * @param {Object} [options] - extra props to add (i.e. {namePrefix})
 * @returns {Array<Object>} list - of slider field definitions
 */
export function toSlider (fields, options) {
  return fields.map(field => {
    const [min, max] = FIELD.MIN_MAX[field.id]
    return {...options, ...field, min, max, defaultValue: [min, max], view: FIELD.TYPE.SLIDER}
  })
}
