import { LANGUAGE, LANGUAGE_LEVEL } from '../constants'
import { ACTIVE } from './_envs'

/**
 * PROJECT DEFINITIONS =========================================================
 * =============================================================================
 */

export const CURRENCY = {
  USD: {
    code: 'USD',
    [LANGUAGE.ENGLISH.code]: 'USD',
  },
  RUB: {
    code: 'RUB',
    [LANGUAGE.ENGLISH.code]: 'RUB',
  },
}
ACTIVE.CURRENCY = CURRENCY.USD
export const PHONE = {
  MOBILE: {
    code: 'mobile',
    [LANGUAGE.ENGLISH.code]: 'Mobile Phone'
  },
  HOME: {
    code: 'home',
    [LANGUAGE.ENGLISH.code]: 'Home Phone'
  },
  WORK: {
    code: 'work',
    [LANGUAGE.ENGLISH.code]: 'Work Phone'
  },
}

export const TYPE = {
  LANGUAGE: {
    key: 'lang',
    [LANGUAGE.ENGLISH.code]: 'Language'
  },
  LANGUAGE_LEVEL: {
    key: 'langLevel',
    [LANGUAGE.ENGLISH.code]: 'Language Level'
  },
  PHONE: {
    key: 'phones',
    [LANGUAGE.ENGLISH.code]: 'Phone'
  },
}
export const TYPE_BY = {
  [TYPE.LANGUAGE.key]: TYPE.LANGUAGE,
  [TYPE.PHONE.key]: TYPE.PHONE,
}

export const OPTIONS = {
  CURRENCY: optionsFrom(CURRENCY),
  PHONE: optionsFrom(PHONE),
}

export const DEFINITION = {
  [TYPE.LANGUAGE.key]: LANGUAGE,
  [TYPE.PHONE.key]: PHONE,
}

export const DEFINITION_BY_CODE = {
  LANGUAGE: definitionByCode(LANGUAGE),
  LANGUAGE_LEVEL: definitionByCode(LANGUAGE_LEVEL),
  [TYPE.LANGUAGE.key]: definitionByCode(LANGUAGE),
}

export const ENUM = {
  LANGUAGE: enumFrom(LANGUAGE),
  LANGUAGE_LEVEL: enumFrom(LANGUAGE_LEVEL),
}

/**
 * Define Getters and Setters for Definition Object to avoid duplicate definitions by mistake
 * @example:
 *    const FIELD = getSetDefinitions('TYPE', 'ID')
 *    FIELD.TYPE = {
 *      EXPAND: 'Expand',
 *      COLLAPSE: 'Expand', // throws error because of duplicate value 'Expand'
 *    }
 *    ....
 *    FIELD.TYPE = {
 *      EXPAND: 'Expand' // throws error the second time because of duplicate key 'EXPAND'
 *    }
 *
 * @param {String} props - list of definition keys
 * @returns {Object} DEFINITION - with getters and setters defined for given `props`
 */
export function getSetDefinition (...props) {
  const DEFINITION = {}
  props.forEach(prop => {
    const _key = `_${prop}`
    Object.defineProperty(DEFINITION, prop, {
      get () {
        return this[_key]
      },
      set (def) {
        if (!this[_key]) this[_key] = {}
        const data = this[_key]
        for (const key in def) {
          if (data[key] != null)
            throw new Error(`Duplicate ${prop}[${key}] definition ${JSON.stringify(def, null, 2)}`)
          const value = def[key]
          for (const i in data) {
            if (data[i] === value)
              throw new Error(`Duplicate ${prop}[${key}] definition value "${value}" ${JSON.stringify(def, null, 2)}`)
          }
          data[key] = value
        }
        return data
      },
    })
  })
  return DEFINITION
}

/**
 * Generate Enumerable List of Values from given Object Definition
 *
 * @param {Object<NAME<code...>>} DEFINITION - key/value pairs of variable name with its code value
 * @returns {Array<String>} enums - list of enumerable values
 */
export function enumFrom (DEFINITION) {
  return Object.values(DEFINITION).map(({code}) => code)
}

/**
 * Map Object Definition by its Code
 *
 * @param {Object<NAME<code...>>} DEFINITION - key/value pairs of variable name with its code value
 * @return {Object<code<code...>>} definition - grouped by its's code
 */
export function definitionByCode (DEFINITION) {
  const result = {}
  for (const name in DEFINITION) {
    const def = DEFINITION[name]
    result[def.code] = def
  }
  return result
}

/*
 * Extract Dropdown Options by Language for Given Object Definition
 * @example:
 *    const options = optionsFrom(LANGUAGE)
 *    <Dropdown options={options.items} .../> // options for currently active language can be accessed via `items`,
 *    <Dropdown options={options[LANGUAGE.ENGLISH.code]} .../> // or directly via language code
 *
 * @param {Object<NAME<code...>>|Array<code...>} DEFINITION - key/value pairs of variable name with its code value
 * @return {Object<items, lang[{text, value}]>} options - grouped by language code, with .items pointing to active lang
 */
export function optionsFrom (DEFINITION) {
  const options = {
    get items () {
      return this[ACTIVE.LANG.code]
    }
  }
  for (const key in DEFINITION) {
    const {code: value, ...langs} = DEFINITION[key]
    for (const lang in langs) {
      const text = langs[lang]
      // Dropdown `value` cannot be array because of shallow match
      options[lang] = (options[lang] || []).concat({text, value: value.constructor === Array ? value.join(',') : value})
    }
  }
  return options
}

/**
 * Create Initial Values for given Object Definition
 *
 * @param {Object<NAME<code...>>} DEFINITION - key/value pairs of variable name with its code value
 * @param {Number} initValue - the initial value to use for each option
 * @return {Object} initial values - to use with redux form, for example
 */
export function initValuesFor (DEFINITION, initValue = 1) {
  const initValues = {}
  for (const key in DEFINITION) {
    initValues[DEFINITION[key].code] = initValue
  }
  return initValues
}

/**
 * Prepare definitions for localisation, so they can be accessed via .name property without needing active language code
 *
 * @example:
 *    localise(LANGUAGE)
 *    log(LANGUAGE.ENGLISH.name)
 *    >>> English
 *
 * @param {Object|Object<NAME<code...>>} DEFINITION - key/value pairs of variable name with its code value
 *  Multiple definitions can be nested unlimited times inside a single object.
 */
export function localise (DEFINITION) {
  for (const NAME in DEFINITION) {
    const definition = DEFINITION[NAME]
    const {code, key, name} = definition
    if (name == null && (code != null || key != null)) {
      Object.defineProperty(DEFINITION[NAME], 'name', {get () { return this[ACTIVE.LANG.code] }})
    } else {
      if (definition.constructor === Object) localise(definition) // recursively process nested definitions
    }
  }
}
