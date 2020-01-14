import { get } from '../common/utils'
import { DEFINITION_BY_CODE } from '../common/variables'
import { OPTIONS, TYPE } from '../common/variables/definitions'
import {
  FIELD_ABOUT,
  FIELD_ADDRESS,
  FIELD_EMAIL,
  FIELD_ID_HIDDEN,
  FIELD_LANGUAGE,
  FIELD_NAME,
  FIELD_PHONE,
  FIELD_RENDER,
  SLIDER_MIN_MAX,
} from './form/constants'
import { phone } from './form/normalizers'
import { email, isRequired, phoneNumber } from './form/validationRules'
import { USER_FIELD } from './user/constants'

/**
 * FIELD DEFINITIONS ===========================================================
 * =============================================================================
 */

// All Field Definitions
export const FIELD = { // to be transformed by selector to currently active language
  ...USER_FIELD,
  [FIELD_ID_HIDDEN]: {
    name: 'id',
    type: 'hidden',
  },
  [FIELD_NAME]: {
    name: 'name',
    label: 'Name',
  },
  [FIELD_ABOUT]: {
    name: 'about',
    label: 'Description',
    hint: 'About me',
    placeholder: 'Enter brief description',
    type: 'textarea',
  },
  [FIELD_EMAIL]: {
    name: 'email',
    label: 'Email',
    placeholder: 'example@gmail.com',
    type: 'email',
    validate: [email],
  },
  [FIELD_ADDRESS]: {
    name: 'place',
    label: 'Address',
    hint: 'My address is',
    placeholder: 'Enter address',
    renderer: FIELD_RENDER.PLACE
  },
  [FIELD_PHONE]: {
    name: 'phones',
    kind: TYPE.PHONE.key,
    options: OPTIONS.PHONE,
    minFields: 1,
    hint: 'My phone number is',
    placeholder: '+7 (555) 555-55-55',
    type: 'tel',
    renderer: FIELD_RENDER.MULTIPLE,
    normalize: phone,
    validate: [phoneNumber]
  },
  [FIELD_LANGUAGE]: {
    name: 'lang',
    kind: TYPE.LANGUAGE.key,
    level: DEFINITION_BY_CODE.LANGUAGE_LEVEL,
    options: OPTIONS.LANGUAGE,
    min: SLIDER_MIN_MAX[FIELD_LANGUAGE][0],
    max: SLIDER_MIN_MAX[FIELD_LANGUAGE][1],
    unit: 'Level',
    hint: 'I speak',
    renderer: FIELD_RENDER.MULTIPLE_LEVEL,
  },
}

/**
 * Construct Form Field Definitions based on given list of fields, returning new Objects
 *
 * @example:
 *    <form onSubmit={handleSubmit(this.submit)} className='max-width-360 margin-h'>
 *      {createInput(FIELDS_FOR_USER).map(renderField)}
 *    </form>
 */
export function createInput (fields, {initialValues: initValues = {}} = {}) {
  return fields.map(({id, ...field}) => ({...FIELD[id], ...field})) // collect definitions
    .map(({name = '', namePrefix = '', options, items, float = true, required, ...field}) => {
      name = namePrefix + name
      const initialValues = get(initValues, name)
      return {
        float,
        ...field,
        ...name && {name},
        ...initialValues && {initialValues},
        ...required && {required, validate: [isRequired, ...(field.validate || [])]},
        ...options && {options: options.items || options}, // options need to fallback in case already lang already set
        ...items && {items: createInput(items, {initialValues})}, // nested fields in group
      }
    })
}
