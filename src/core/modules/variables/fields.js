import { definitionSetup, LANGUAGE_LEVEL } from '../../utils'

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
  // Declared here rather than in `engine/rules.js`, which used to register them (§9.3 step 2).
  // `engine/mapper.js` dispatches on all six, and `rules.js` imports `mapper.js` — so the resolver
  // depended on a constant its own importer installed. With the `engine` <-> `modules/form` cycle
  // gone, anything that loaded the mapper without also loading `rules.js` got a resolver whose
  // `case` for each of these compared against `undefined`, silently making six documented views
  // unreachable. Two mapper tests found it immediately; a consumer would have found it later.
  // Declared here rather than in `modules/form/constants.js`, which used to register them
  // (§9.3 step 3): `engine/utils.js` compares a meta node against `FIELD.TYPE.SELECT`, so that
  // comparison depended on whether anything had imported the form module yet.
  INPUT: 'Input', // generic input of different types (i.e. type='text', 'textarea', etc.)
  SELECT: 'Select', // dropdown / listbox field
  SLIDER: 'SliderLabel', // slider field with label
  TOGGLE: 'Toggle', // checkbox rendered as toggle button
  UPLOAD: 'Upload',  // single file upload with drag & drop
  AUTO_SUBMIT: 'AutoSubmit',
  DATA: 'Data',
  ICON: 'Icon',
  IMAGE: 'Image',
  POPUP: 'Popup',
  TABLE_CELLS: 'TableCells',
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
