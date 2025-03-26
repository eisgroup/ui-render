import { definitionSetup, LANGUAGE_LEVEL } from 'ui-utils-pack'
import { TYPE } from './definitions'

/**
 * FIELD DEFINITIONS ===========================================================
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
  STRING: 'String',
  DATE: 'Date'
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
