import { LANGUAGE_LEVEL } from '../constants'
import { getSetDefinition } from './definitions'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */
export const FIELD = getSetDefinition('TYPE', 'RENDER', 'ACTION', 'ID', 'DEF', 'MIN_MAX', 'FOR')

// Field Type Definitions
FIELD.TYPE = {
  BUTTON: 'Button',
  EXPAND: 'Expand', // Expandable/collapsing content with clickable `title` or `renderLabel` area
  COL: 'Col', // Vertical column layout
  COL2: 'Column', // alias for Column
  COL3: 'VerticalLayout', // alias for Column
  COUNTER: 'Counter', // Animated number changing from `start` to `end` values
  LABEL: 'Label',
  PIE_CHART: 'PieChart', // Pie chat (can be in shape of donut) with optional legends
  ROW: 'Row', // Horizontal row layout
  ROW2: 'HorizontalLayout', // alias for Row
  SPACE: 'Space', // for adding space between items
  TABLE: 'Table',
  TABS: 'Tabs',
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
