import { CHANGE, ERROR, FINISH, START, SUBMIT, SUCCESS } from '../../common/constants'
import { FIELD } from '../../common/variables/fields'

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
export function toSlider(fields, options) {
  return fields.map(field => {
    const [min, max] = FIELD.MIN_MAX[field.id]
    return {...options, ...field, min, max, defaultValue: [min, max], view: FIELD.TYPE.SLIDER}
  })
}
