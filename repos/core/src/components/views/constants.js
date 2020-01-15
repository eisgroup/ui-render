import { getSetDefinition } from '../../common/variables'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */
export const FIELD = getSetDefinition('TYPE', 'ID', 'DEF', 'MIN_MAX', 'FOR')

// Field Type Definitions
FIELD.TYPE = {
  EXPAND: 'Expand',
  COL: 'Col',
  ROW: 'Row',
  TABLE: 'Table',
  TITLE: 'Title',
  // ...to be populated by modules
}

// Field IDs for uniquely identifying field definitions
FIELD.ID = {
  // ...to be populated by modules
}

// Field Definitions by ID
FIELD.DEF = {
  // ...to be populated by modules
}

// Field Min/Max Value Definitions by ID (used for extending base definitions from FIELD.DEF)
FIELD.MIN_MAX = {
  // ...to be populated by modules
}

// List of Field IDs with optional base definition overrides
FIELD.FOR = {
  // ...to be populated by modules
}
