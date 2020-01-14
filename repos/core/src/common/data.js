import { languageDropdownOptions } from '../components/renders'
import { LANGUAGE } from './constants'
import { OPTIONS } from './variables/definitions'

/**
 * COMMON STATE DATA ===========================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */

export const LANGUAGE_BY = { // country code
  AU: LANGUAGE.ENGLISH.code,
  US: LANGUAGE.ENGLISH.code,
  UK: LANGUAGE.ENGLISH.code,
  RU: LANGUAGE.RUSSIAN.code,
}
OPTIONS.LANGUAGE = languageDropdownOptions(LANGUAGE)
