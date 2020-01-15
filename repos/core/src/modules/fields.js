import { get } from '../common/utils'
import { OPTIONS, TYPE } from '../common/variables/definitions'
import { FIELD } from '../components/views/constants'
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
 * Construct Form Field Definitions based on given list of fields, returning new Objects
 *
 * @example:
 *    <form onSubmit={handleSubmit(this.submit)} className='max-width-360 margin-h'>
 *      {createInput(FIELDS_FOR_USER).map(renderField)}
 *    </form>
 */
export function createInput (fields, {initialValues: initValues = {}} = {}) {
  return fields.map(({id, ...field}) => ({...FIELD.DEF[id], ...field})) // collect definitions
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
