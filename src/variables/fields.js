import { isRequired } from 'react-ui-pack/inputs/validationRules'
import { definitionSetup, get, hasListValue, LANGUAGE_LEVEL, toList } from 'utils-pack'
import { TYPE } from './definitions'

/**
 * FIELD DEFINITIONS ===========================================================
 * @usage:
 *    FIELD.FOR = {
 *      CONTACT: [
 *        {id: FIELD.ID.EMAIL, required: true},
 *        {id: FIELD.ID.PHONE},
 *      ]
 *    }
 *
 *    @withForm()
 *    export default class ContactForm extends PureComponent {
 *      render () {
 *        return this.renderInput(FIELD.FOR.CONTACT)
 *      }
 *    }
 * =============================================================================
 */
export const FIELD = definitionSetup('TYPE', 'RENDER', 'ACTION', 'ID', 'DEF', 'MIN_MAX', 'FOR')

// Field Type Definitions
FIELD.TYPE = {
  BUTTON: 'Button',
  EXPAND: 'Expand', // Expandable/collapsing content with clickable `title` or `renderLabel` area
  EXPAND_LIST: 'ExpandList', // list of Expand components with dynamic `renderLabel` and `renderItem` attributes
  CHECKBOX: 'Checkbox', // checkbox with optional label
  COL: 'Col', // Vertical column layout
  COL2: 'Column', // alias for Column
  COL3: 'VerticalLayout', // alias for Column
  COL_LIST: 'ColList', // alias for List
  COL_LIST3: 'VerticalList', // alias for List
  COUNTER: 'Counter', // Animated number changing from `start` to `end` values
  DROPDOWN: 'Dropdown', // Semantic UI Dropdown
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
  TOOLTIP: 'Tooltip', // A hint components that pops up when element is being hovered
  // ...to be populated by modules
}

// Value Renderer Definitions
FIELD.RENDER = {
  CURRENCY: 'Currency',
  PERCENT: 'Percent',
  DOUBLE5: 'Double5',
  FLOAT: 'Float',
  TITLE_n_INPUT: 'Title+Input',
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
  ID: 'id', // use lower case value so it can be used as input.name by default
  ID_HIDDEN: 'id_hidden', // input `name` should be set to `id`, defining with underscore to avoid potential conflict
  NAME: 'name',
  EMAIL: 'email',
  ABOUT: 'about',
  ADDRESS: 'address',
  LANGUAGE: 'language',
  PHONE: 'phone',
  WEBSITE: 'website',

  // ...to be populated by modules
}

// Field Min/Max Value Definitions by ID (used for extending base definitions from FIELD.DEF)
FIELD.MIN_MAX = {
  // Common
  [FIELD.ID.LANGUAGE]: [LANGUAGE_LEVEL.BASIC._, LANGUAGE_LEVEL.NATIVE._],
  // ...to be populated by modules
}

// Field Definitions by ID
FIELD.DEF = {
  // ...to be populated by modules (see form/constants for reference)
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
  return fields.map(({id, ...field}) => ({id, ...FIELD.DEF[id], ...field}))
    // Process prefixes
    .map(({name = '', namePrefix = '', options, items, float, required, disabled, readonly, validate, ...field}) => {
      name = namePrefix + name
      const initialValues = get(initValues, name)
      const validations = []
      if (required) validations.push(isRequired)
      if (validate) validations.push(...toList(validate, 'clean'))
      return {
        float,
        ...field,
        ...initialValues && {initialValues},
        ...name && {name},
        ...disabled != null && {disabled},
        ...readonly != null && {readonly},
        ...required != null && {required}, // required may be false for nested field inside required group
        ...validations.length && {validate: validateMultiple(validations)},
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

/* Convert multiple validation functions into a single function */
function validateMultiple (validations) {
  return function (...args) {
    for (const validate of validations) {
      const error = validate(...args)
      if (error) return error
    }
  }
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
