import { Active } from './_envs.js'
import { LANGUAGE } from './constants.js'

/**
 * PROJECT DEFINITIONS =========================================================
 * =============================================================================
 */

/**
 * Define Getters and Setters for Definition Object to avoid duplicate definitions by mistake
 *
 * @example:
 *    const FIELD = definitionSetup('TYPE', 'ID')
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
 * @returns {Object} DEFINITION - new object with getters and setters defined for given `props`
 */
export function definitionSetup (...props) {
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
 * Map Object Definition by its Underscore Value
 *
 * @example:
 *  definitionByValue(LANGUAGE)
 *  >>> {
 *        'en': {
 *          _: 'en',
 *          'en': 'English'
 *          ...
 *        },
 *        ...
 *      }
 *
 * @param {Object<KEY<_...>>|Array<_...>} DEFINITION - key/value pairs of variable name with its underscore value
 * @return {Object<_<_...>>} definition - grouped by its underscore value
 */
export function definitionByValue (DEFINITION) {
  const result = {}
  for (const index in DEFINITION) {
    const def = DEFINITION[index]
    result[def._] = def
  }
  return result
}

/**
 * Generate Enumerable List of Values from given Object Definition
 *
 * @example:
 *  enumFrom(LANGUAGE)
 *  >>> ['en', 'fr'...]
 *
 * @param {Object<KEY<_...>>|Array<_...>} DEFINITION - key/value pairs of variable name with its underscore value
 * @returns {Array<String>} enums - list of enumerable values
 */
export function enumFrom (DEFINITION) {
  const list = []
  for (const index in DEFINITION) {
    list.push(DEFINITION[index]._)
  }
  return list
}

/*
 * Extract Dropdown Options by Language for Given Object Definition
 *
 * @example:
 *    const options = optionsFrom(LANGUAGE)
 *    <Dropdown options={options.items} .../> // options for currently active language can be accessed via `items`,
 *    <Dropdown options={options[LANGUAGE.ENGLISH._]} .../> // or directly via language _
 *
 * @param {Object<KEY<_...>>|Array<_...>} DEFINITION - key/value pairs of variable name with its underscore value
 * @return {Object<items, lang[{text, value}]>} options - grouped by language underscore value, with .items pointing to active lang
 */
export function optionsFrom (DEFINITION) {
  const options = {
    get items () {
      return this[Active.LANG._] || this[LANGUAGE.ENGLISH._] || []
    }
  }
  for (const index in DEFINITION) {
    const {_: value, ...langs} = DEFINITION[index]
    for (const lang in langs) {
      const text = langs[lang]
      // Dropdown `value` cannot be array because of shallow match
      options[lang] = (options[lang] || []).concat({text, value: value.constructor === Array ? value.join(',') : value})
    }
  }
  return options
}

/**
 * Prepare definitions for localisation, so they can be accessed via .name property without needing active language _
 *
 * @example:
 *    localise(LANGUAGE)
 *    console.log(LANGUAGE.ENGLISH.name)
 *    >>> English
 *
 * @param {Object|Object<KEY<_...>>|Array<_...>} DEFINITION - key/value pairs of variable name with its _ value
 *    Multiple definitions can be nested unlimited times inside a single object.
 */
export function localise (DEFINITION) {
  for (const index in DEFINITION) {
    const definition = DEFINITION[index]
    const {_, name} = definition
    if (name == null && _ != null) {
      Object.defineProperty(DEFINITION[index], 'name', {
        get () {
          return this[Active.LANG._] != null
            ? this[Active.LANG._]
            : (this[LANGUAGE.ENGLISH._] != null ? this[LANGUAGE.ENGLISH._] : String(_))
        }
      })
    } else {
      if (definition.constructor === Object) localise(definition, Active) // recursively process nested definitions
    }
  }
}

/**
 * Prepare translations for localisation by mutation, so they can be accessed directly via .TEXT property
 * @Note: can be applied repeatedly to add new translations or languages after requests from API
 *
 * @example:
 *    const _ = localiseTranslation(TRANSLATIONS)
 *    log(_.SEARCH)
 *    # if active language is English
 *    >>> 'Search'
 *    # if active language is Russian
 *    >>> 'Поиск'
 *
 * Add language:
 *    _.SEARCH = {
 *      ..., // previous definitions
 *      [l.CHINESE]: '搜索', // language addition
 *    }
 *    log(_.SEARCH)
 *    # if active language is Chinese
 *    >>> 搜索
 *
 * @param {Object|Object<KEY<_...>>} TRANSLATION - key/value pairs of variable name with its localised values
 * @returns {Object} translations - with all definitions as javascript getters returning currently active language,
 *  (falls back to English if definition not found for active language, or empty string).
 */
export function localiseTranslation (TRANSLATION) {
  for (const KEY in TRANSLATION) {
    const _data = TRANSLATION[KEY]
    // Update existing translations
    if (KEY in localiseTranslation.instance) {
      localiseTranslation.instance[KEY] = _data
    } else {
      // Define translations for the first time
      const _key = '~' + KEY
      Object.defineProperty(localiseTranslation.instance, KEY, {
        get () {
          // initially cannot use setter to define translations, thus fallback to _data
          const data = localiseTranslation.instance[_key] || (localiseTranslation.instance[_key] = _data)
          return data[Active.LANG._] || data[Active.DEFAULT.LANGUAGE] || KEY || ''
        },
        set (data) {
          // merge new translations with existing
          localiseTranslation.instance[_key] = {...localiseTranslation.instance[_key], ...data}
        }
      })
    }
  }
  return localiseTranslation.instance
}

localiseTranslation.instance = {}
localiseTranslation.queriedById = {}

/**
 * Create Initial Values for given Object Definition
 *
 * @example:
 *  initValuesFor(LANGUAGE, LANGUAGE_LEVEL.BASIC._)
 *  >>> {'en': 1, 'fr': 1, ...}
 *
 * @param {Object<KEY<_...>>} DEFINITION - key/value pairs of variable name with its underscore value
 * @param {Number} initValue - the initial value to use for each option
 * @return {Object} initial values - to use with redux form, for example
 */
export function initValuesFor (DEFINITION, initValue = 1) {
  const initValues = {}
  for (const key in DEFINITION) {
    initValues[DEFINITION[key]._] = initValue
  }
  return initValues
}

/**
 * Convert Single/Multiple Definition Values into Human Friendly String/s
 *
 * @param {String|Number|Array} values - definition's underscore value/s
 * @param {Object} definitionByValue - example: definitionByValue(LANGUAGE)
 * @param {*} [output] - one of types (i.e. String, Array, etc.)
 * @returns {String|Array<String>} string/s - for human consumption
 */
export function valueToName (values, definitionByValue, output = String) {
  const items = ((values && values.constructor === Array) ? values : [values]).map(code => (definitionByValue[code] || {}).name)
  switch (output) {
    case Array:
      return items
    case String:
    default:
      return items.join(' ' + _.OR + ' ')
  }
}
