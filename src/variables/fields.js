import { phone } from 'react-ui-pack/inputs/normalizers'
import { email, isRequired, phoneNumber } from 'react-ui-pack/inputs/validationRules'
import { definitionSetup, get, hasListValue, LANGUAGE_LEVEL } from 'utils-pack'
import { OPTIONS, TYPE } from './definitions'

/**
 * FIELD DEFINITIONS ===========================================================
 * =============================================================================
 */
export const FIELD = definitionSetup('TYPE', 'RENDER', 'ACTION', 'ID', 'DEF', 'MIN_MAX', 'FOR')

// Field Type Definitions
FIELD.TYPE = {
  BUTTON: 'Button',
  EXPAND: 'Expand', // Expandable/collapsing content with clickable `title` or `renderLabel` area
  EXPAND_LIST: 'ExpandList', // list of Expand components with dynamic `renderLabel` and `renderItem` attributes
  COL: 'Col', // Vertical column layout
  COL2: 'Column', // alias for Column
  COL3: 'VerticalLayout', // alias for Column
  COL_LIST: 'ColList', // alias for List
  COL_LIST3: 'VerticalList', // alias for List
  COUNTER: 'Counter', // Animated number changing from `start` to `end` values
  LABEL: 'Label',
  LIST: 'List', // list of Col components with dynamic `renderItem` attributes
  PIE_CHART: 'PieChart', // Pie chat (can be in shape of donut) with optional legends
  PROGRESS_STEPS: 'ProgressSteps', // Progress Steps, with content like Tabs
  ROW: 'Row', // Horizontal row layout
  ROW2: 'HorizontalLayout', // alias for Row
  ROW_LIST: 'RowList', // alias for List with Row layout
  ROW_LIST2: 'HorizontalList', // alias for List with Row layout
  SPACE: 'Space', // for adding space between items
  TABLE: 'Table',
  TABS: 'Tabs',
  TAB_LIST: 'TabList',
  TEXT: 'Text',
  TITLE: 'Title', // A customised `Text` view with certain styling for consistent look and feel
  // ...to be populated by modules
}

// Value Renderer Definitions
FIELD.RENDER = {
  CURRENCY: 'currency',
  PERCENT: 'percent',
  DOUBLE5: 'double5',
  FLOAT: 'float',
  TITLE_n_INPUT: 'title+input',
}

// Action Type Definitions
FIELD.ACTION = {
  RESET: 'reset',
  SET_STATE: 'setState',
  FETCH: 'fetch',
  POPUP: 'popup',
  WARN: 'warn',
}

// Action Methods by Action Type Definitions
FIELD.FUNC = {
  [FIELD.ACTION.WARN]: console.warn,
}

// Field IDs for uniquely identifying field definitions
FIELD.ID = {
  // Common Inputs
  NAME: 'NAME',
  EMAIL: 'EMAIL',
  ABOUT: 'ABOUT',
  ADDRESS: 'ADDRESS',
  LANGUAGE: 'LANGUAGE',
  PHONE: 'PHONE',
  WEBSITE: 'WEBSITE',
  ID_HIDDEN: 'ID_HIDDEN', // default input `name` is `id`

  // ...to be populated by modules
}

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
    kind: TYPE.PHONE._,
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

// Field Min/Max Value Definitions by ID (used for extending base definitions from FIELD.DEF)
FIELD.MIN_MAX = {
  // Common
  [FIELD.ID.LANGUAGE]: [LANGUAGE_LEVEL.BASIC.code, LANGUAGE_LEVEL.NATIVE.code],
  // ...to be populated by modules
}

// Field Definitions by ID
FIELD.DEF = {
  // ...to be populated by modules
}

// List of Field IDs with optional base definition overrides
FIELD.FOR = {
  // ...to be populated by modules
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
    .map(({name = '', namePrefix = '', options, items, float, required, disabled, readonly, ...field}) => {
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
