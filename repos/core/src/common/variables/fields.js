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
