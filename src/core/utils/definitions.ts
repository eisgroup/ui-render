import { Active } from './_envs'
import { LANGUAGE } from './constants'

/**
 * @Note on the types (§9.6-E1): the values inside a definition are whatever the platform puts
 * there - a string code, a number, a list of codes, a localised label, or a nested definition.
 * They are typed `unknown` rather than `string`, because every one of the shapes above really
 * occurs (see `__tests__/definitions.enums-and-localization.test.js`). Nothing here narrows or
 * validates its input: these helpers walk plain objects and hand back what they found.
 */

/** A single definition: its `_` value plus localised labels keyed by language code */
export interface DefinitionEntry {
  /** canonical value of the definition - a code, a number, or a list of codes */
  _?: unknown

  /** localised label under a language code (`en`, `ru`, ...), or any other metadata */
  [key: string]: unknown
}

/** Definitions as declared by the platform: keyed by variable name, or as a plain list */
export type DefinitionSource = Record<string, DefinitionEntry> | readonly DefinitionEntry[]

/** A group of definitions assigned to one `definitionSetup` prop (e.g. `FIELD.TYPE`) */
export type Definition = Record<string, unknown>

/** One `<Dropdown options>` entry produced by {@link optionsFrom} */
export interface DefinitionOption {
  /** localised label of the definition in the language this list belongs to */
  text: unknown

  /** the definition `_` value, with list values joined by `,` (Dropdown matches shallowly) */
  value: unknown
}

/** Dropdown options grouped by language code, with `items` pointing at the active language */
export interface DefinitionOptions {
  /** options of the currently active language, falling back to English and then to `[]` */
  readonly items: DefinitionOption[]

  [lang: string]: DefinitionOption[]
}

/** Localised values of a single phrase, keyed by language code */
export type Translation = Record<string, string>

/**
 * The single translation instance: a phrase `KEY` reads back as the localised `string`, while the
 * `~KEY` slot behind it holds the raw {@link Translation} that the getter and setter work with.
 */
export type Translations = Record<string, string | Translation>

const hasOwn = (object: object, key: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(object, key)

/**
 * @Note: `key` is `unknown` because definition `_` values are - `defineProperty` coerces a
 * non-symbol key to a string, exactly as it did before this file was typed.
 */
const setOwn = <T extends object> (object: T, key: unknown, value: unknown): T => Object.defineProperty(object, key as PropertyKey, {
  configurable: true,
  enumerable: true,
  writable: true,
  value,
})

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
 * @param props - list of definition keys
 * @returns DEFINITION - new object with getters and setters defined for given `props`
 *  @Note: each prop reads back `undefined` until it is assigned for the first time; it is typed as
 *    always present because every call site assigns on module initialisation.
 */
export function definitionSetup<P extends string> (...props: P[]): Record<P, Definition> {
  const DEFINITION = {} as Record<P, Definition>
  props.forEach(prop => {
    const _key = `_${prop}`
    Object.defineProperty(DEFINITION, prop, {
      get (this: Record<string, Definition | undefined>) {
        return this[_key]
      },
      set (this: Record<string, Definition | undefined>, def: Definition) {
        if (!this[_key]) this[_key] = {}
        const data = this[_key] as Definition
        for (const key of Object.keys(def)) {
          if (hasOwn(data, key))
            throw new Error(`Duplicate ${prop}[${key}] definition ${JSON.stringify(def, null, 2)}`)
          const value = def[key]
          for (const i of Object.keys(data)) {
            if (data[i] === value)
              throw new Error(`Duplicate ${prop}[${key}] definition value "${value}" ${JSON.stringify(def, null, 2)}`)
          }
          setOwn(data, key, value)
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
 * @param DEFINITION - key/value pairs of variable name with its underscore value
 * @return definition - grouped by its underscore value
 */
export function definitionByValue (DEFINITION: DefinitionSource): Record<string, DefinitionEntry> {
  const result: Record<string, DefinitionEntry> = {}
  for (const index of Object.keys(DEFINITION)) {
    const def = (DEFINITION as Record<string, DefinitionEntry>)[index]
    setOwn(result, def._, def)
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
 * @param DEFINITION - key/value pairs of variable name with its underscore value
 * @returns enums - list of enumerable values (whatever `_` holds: codes, numbers, or lists)
 */
export function enumFrom (DEFINITION: DefinitionSource): unknown[] {
  const list: unknown[] = []
  for (const index of Object.keys(DEFINITION)) {
    list.push((DEFINITION as Record<string, DefinitionEntry>)[index]._)
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
 * @param DEFINITION - key/value pairs of variable name with its underscore value
 * @return options - grouped by language underscore value, with .items pointing to active lang
 */
export function optionsFrom (DEFINITION: DefinitionSource): DefinitionOptions {
  const options: DefinitionOptions = {
    get items () {
      // @Note: `this` is the options object itself, indexed by language code
      return (this as DefinitionOptions)[Active.LANG._] || (this as DefinitionOptions)[LANGUAGE.ENGLISH._] || []
    }
  }
  for (const index of Object.keys(DEFINITION)) {
    const {_: value, ...langs} = (DEFINITION as Record<string, DefinitionEntry>)[index]
    for (const lang of Object.keys(langs)) {
      const text = langs[lang]
      // Dropdown `value` cannot be array because of shallow match
      const languageOptions = hasOwn(options, lang) ? options[lang] : []
      setOwn(options, lang, languageOptions.concat({text, value: Array.isArray(value) ? value.join(',') : value}))
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
 * @param DEFINITION - key/value pairs of variable name with its _ value
 *    Multiple definitions can be nested unlimited times inside a single object.
 * @param _Active - vestigial: passed by the recursive call below and never read
 */
export function localise (DEFINITION: Record<string, unknown>, _Active?: unknown): void {
  for (const index of Object.keys(DEFINITION)) {
    const definition = DEFINITION[index] as DefinitionEntry
    const {_, name} = definition
    if (name == null && _ != null) {
      Object.defineProperty(DEFINITION[index], 'name', {
        get (this: DefinitionEntry) {
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
 * @param TRANSLATION - key/value pairs of variable name with its localised values
 * @returns translations - with all definitions as javascript getters returning currently active language,
 *  (falls back to English if definition not found for active language, or empty string).
 */
export function localiseTranslation (TRANSLATION: Record<string, Translation>): Translations {
  for (const KEY of Object.keys(TRANSLATION)) {
    const _data = TRANSLATION[KEY]
    // Update existing translations
    if (hasOwn(localiseTranslation.instance, KEY)) {
      localiseTranslation.instance[KEY] = _data
    } else {
      // Define translations for the first time
      const _key = '~' + KEY
      Object.defineProperty(localiseTranslation.instance, KEY, {
        get () {
          // initially cannot use setter to define translations, thus fallback to _data
          // @Note: the `~` slot only ever holds the raw translation object
          const data = (localiseTranslation.instance[_key] || (localiseTranslation.instance[_key] = _data)) as Translation
          return data[Active.LANG._] || data[Active.DEFAULT.LANGUAGE] || KEY || ''
        },
        set (data: Translation) {
          // merge new translations with existing
          localiseTranslation.instance[_key] = {...(localiseTranslation.instance[_key] as Translation | undefined || _data), ...data}
        }
      })
    }
  }
  return localiseTranslation.instance
}

localiseTranslation.instance = {} as Translations
localiseTranslation.queriedById = {} as Record<PropertyKey, unknown>
