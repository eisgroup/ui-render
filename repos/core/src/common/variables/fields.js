import { LANGUAGE_LEVEL } from '../constants'
import { getSetDefinition } from './definitions'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */
export const FIELD = getSetDefinition('TYPE', 'ID', 'DEF', 'MIN_MAX', 'FOR')

// Field Type Definitions
FIELD.TYPE = {
  // Renderers
  EXPAND: 'Expand',
  COL: 'Col',
  ROW: 'Row',
  TABLE: 'Table',
  TITLE: 'Title',

  // ...to be populated by modules
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
