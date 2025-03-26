import { OPTIONS, TYPE } from 'ui-modules-pack/variables/definitions'
import { FIELD } from 'ui-modules-pack/variables/fields'
import { phone } from 'ui-react-pack/inputs/normalizers'
import { email, isRequired, maxLength, password, phoneNumber, url } from 'ui-react-pack/inputs/validationRules'
import { _ } from 'ui-utils-pack/translations'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const NAME = 'FORM'  // Namespace this module
export const FORM_ASYNC_VALIDATE = 'FORM_ASYNC_VALIDATE'
export const API_VALIDATE_FAIL_CODE = 422

// Field Type Definitions
FIELD.TYPE = {
  DATE: 'Date',
  DATES: 'Dates', // multiple date ranges with `from` and `to` times
  GROUP: 'Group', // group of semantically related fields (i.e. pay rate and currency)
  INPUT: 'Input', // generic input of different types (i.e. type='text', 'textarea', etc.)
  SELECT: 'Select', // Semantic UI Dropdown
  SLIDER: 'SliderLabel', // slider field with label
  TOGGLE: 'Toggle', // checkbox rendered as toggle button
  MULTIPLE: 'Fields', // multiple fields of the same type (i.e. mobile/work/home phone numbers)
  MULTIPLE_LEVEL: 'FieldsWithLevel',  // multiple fields of the same type, each having a value in predefined scale
  PLACE: 'Place',  // Google Places Autocomplete
  UPLOAD: 'Upload',  // single file upload with drag & drop
  UPLOAD_GRID: 'UploadGrid',  // multiple uploads in grid layout
  UPLOAD_GRIDS: 'UploadGrids',  // multiple uploads in grid layout of different kinds as separate tabs
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

// Field Definitions
FIELD.DEF = {
  [FIELD.ID.EMAIL]: {
    name: 'email',
    get label () {return _.EMAIL},
    get hint () {return _.MY_EMAIL_ADDRESS_IS},
    get placeholder () {return _.EXAMPLE_GMAIL_COM},
    type: 'email',
    validate: email,
    view: FIELD.TYPE.INPUT, // required definition
  },
  [FIELD.ID.PHONE]: {
    name: 'phones',
    get labelType () {return TYPE.PHONE.name},
    get hint () {return _.MY_PHONE_NUMBER_IS},
    get placeholder () {return _.plus_1_555_555_55_55},
    options: OPTIONS.PHONE,
    minFields: 1,
    type: 'tel',
    normalize: phone,
    validate: [phoneNumber],
    view: FIELD.TYPE.MULTIPLE,
  },
}

// Field props
export const allowAdditions = true
export const stickyPlaceholder = true
export const lefty = true
export const disabled = true
export const readonly = true
export const multiple = true
export const required = true
export const search = true
export const upward = true

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
