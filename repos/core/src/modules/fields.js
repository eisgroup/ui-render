import { get, hasListValue } from '../common/utils'
import { OPTIONS, TYPE } from '../common/variables/definitions'
import { FIELD } from '../common/variables/fields'
import { phone } from './form/normalizers'
import { email, isRequired, phoneNumber } from './form/validationRules'

/**
 * FIELD DEFINITIONS ===========================================================
 * =============================================================================
 */

// Project Field Definitions
FIELD.DEF = {
  [FIELD.ID.EMAIL]: {
    name: 'email',
    label: 'Email',
    placeholder: 'example@gmail.com',
    type: 'email',
    validate: [email],
  },
  [FIELD.ID.PHONE]: {
    name: 'phones',
    kind: TYPE.PHONE.key,
    options: OPTIONS.PHONE,
    minFields: 1,
    hint: 'My phone number is',
    placeholder: '+7 (555) 555-55-55',
    type: 'tel',
    view: FIELD.TYPE.MULTIPLE,
    normalize: phone,
    validate: [phoneNumber]
  },
}

/**
 * Construct Field Definitions based on given list of fields, returning new Objects
 *
 * @example:
 *    <form onSubmit={handleSubmit(this.submit)} className='max-width-360 margin-h'>
 *      {fieldsFrom(FIELD.FOR.USER).map(renderField)}
 *    </form>
 *
 * @param {Array<Object>} fields - list of fields to create, requires FIELD.ID, used for extending base definition
 * @param {Object} [initialValues] - for redux-form
 * @returns {Array<Object>} list - of field definitions ready for rendering
 */
export function fieldsFrom (fields, {initialValues: initValues = {}} = {}) {
  // Collect definitions
  return fields.map(({id, ...field}) => ({...FIELD.DEF[id], ...field}))
    // Process prefixes
    .map(({name = '', namePrefix = '', options, items, float = true, required, disabled, readonly, ...field}) => {
      name = namePrefix + name
      const initialValues = get(initValues, name)
      return {
        float,
        ...field,
        ...initialValues && {initialValues},
        ...name && {name},
        ...disabled != null && {disabled},
        ...readonly != null && {readonly},
        ...required != null && {required}, // required may be false for nested field inside required group
        ...required && {validate: [isRequired, ...(field.validate || [])]},
        ...options && {options: options.items || options}, // options need to fallback in case lang already set
        ...items && { // nested fields in group
          items: fieldsFrom(items.map(i => ({
            ...required && {required},
            ...disabled && {disabled},
            ...readonly && {readonly},
            ...i,
          })), {initialValues})
        },
      }
    })
}

/**
 * Get Object of Required Fields mapping by key path to type, based on definition from FIELD.FOR.LIST
 * @example:
 *    requiredFieldsFrom(FIELD.FOR.USER)
 *    >>> {'name': String, 'phones.work': Number}
 *
 * @param {Array|Object} fields - FIELD.FOR.LIST
 * @returns {Object} required fields - key/value pairs of key path -> value type
 */
export function requiredFieldsFrom (fields) {
  let result = {}

  fieldsFrom(fields).forEach(field => {
      const {name} = field

      if (hasListValue(field.items)) {
        result = {...result, ...requiredFieldsFrom(field.items)}
      } else if (name && field.required) {

        if (field.type === 'number') {
          return result[name] = Number

        } else if (field.defaultValue != null) {
          return result[name] = field.defaultValue.constructor

        } else if (field.view === FIELD.TYPE.MULTIPLE) {
          if (hasListValue(field.options)) {
            // Field might be marked required for all, but only one is actually required
            // field.options.forEach(option => {
            //   const nestedName = get(option, 'value', '')
            //   result[`${name}.${nestedName}`] = nestedName.constructor
            // })
            // Returning top level object is good enough logic for use with isRequired()
            // since the object must be non-empty to pass validation
            return result[name] = Object
          }

        } else if (hasListValue(field.options)) {
          return result[name] = get(field.options[0], 'value', '').constructor

        } else if (field.view === FIELD.TYPE.TOGGLE) {
          return result[name] = Boolean

        } else if (field.view === FIELD.TYPE.UPLOAD_GRID) {
          return result[name] = Array

        } else if (field.view === FIELD.TYPE.UPLOAD) {
          return result[name] = Object
        }

        return result[name] = String
      }
    }
  )

  return result
}
