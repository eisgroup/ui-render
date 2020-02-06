/**
 * @Summary of strategies used:
 *    1. Recursive Field definitions (i.e. objects with `view` attribute can have nested `items`)
 *        - Field can by any vew rendering component or input
 *
 *    2. Function definitions by name (i.e. attributes starting with the word `render`, etc.)
 *        - Optional arguments can be defined, separated by comma (i.e. `"setState,plan"` -> use "plan" as argument)
 *
 *    3. Custom rendering by matching values (i.e. `renderCell: { values: {...} }` in Table)
 *        - Default function can be defined when no value matches (i.e. `renderCell: { default: "Currency" }`)
 *
 *    4. Data mapping by key paths (i.e. `mapItems`, `mapOptions`)
 *        - String can be used as a mapper (i.e. `mapOptions: "planName"` -> use "planName" attribute as options value)
 *
 *    5. Dynamic definitions with string interpolation (i.e. `name: "{value}"` in Table is replaced with actual value)
 *        - Optional fallback value can be defined after a comma (i.e. `"{value,0}"` -> use "0" as fallback value)
 *
 *    6. Value transform for objects with a single attribute `name` (i.e. `title: {name: "{key}"}` becomes `title: "value"`)
 *        - `name` attribute value will be first transformed using string interpolation for dynamic variables
 *
 *    7. State dependent config and update (i.e. `setState` action with dynamic `{state.value...}` config)
 *        - Dynamic states are transformed on render
 */
const field = {
  // Meta data
  view: 'Col', // * name of React Component used to render this field
  items: [], // recursively nested fields
  readOnly: Boolean, // makes all nested fields disabled, with `readOnly` css class applied
  style: Object, // css style to apply
  className: 'CSS class name to apply',
  onClick: Function, // example: `{onClick: 'setState,active.plan'}` - `setState` function with `active.plan` argument

  // Generic input props
  name: 'adminCosts.adminCategory', // * path to field value within *_data.json
  label: 'Input label',
  placeholder: 'To appear inside empty input when focused',
  type: 'number', // 'text', 'textarea', 'email', etc.
  unit: 'Input value unit label (e.x. "USD" for currency input)',
  icon: 'dollar', // icon css class name -> displays Icon inside Input
  lefty: Boolean, // whether to show icon on the left, default is on the right
  onChange: Function, // callback for input value changes
  float: Boolean, // whether label should float above input when in focus
  disabled: Boolean, // disabled input
  readonly: Boolean, // read-only input
  normalize: [Function], // redux-form input value normalizer function/s
  validate: [Function], // redux-form input value validation function/s
  value: undefined, // controlled input value
  defaultValue: undefined, // to be used on init if `value` not set
  hint: 'Displayed as title text above input',
  info: 'Content to render when input is in focus',
  error: 'Content to render when input is invalid',

  // Dropdown input props (using react Semantic UI Dropdown)
  compact: Boolean,
  multiple: Boolean,
  search: Boolean, // whether dropdown options are searchable
  options: [{text: 'Label for Human', value: 'internal value'}],

  // Slider input props
  min: Number, // minimum value
  max: Number, // maximum value
  step: Number, // slider increment
  pushable: Number, // minimum slider increments between two handles

  // Table view props
  // @see: <TableView /> docs for other props
  inverted: Boolean, // whether to style table in dark mode
  striped: Boolean, // whether to alternate background shade of items (rows in default layout)
  headers: [
    {
      id: String,
      renderCell: String, // name of render Function to use
    },
    {
      id: String,
      renderCell: { // dynamic rendering based on cell value
        values: {
          'value to match': {/* definition of nested fields to render */}
        },
        default: String,
      }
    }
  ],
  extraItems: [ // list of item definitions (rows in default layout)
    { // cell definitions by ID (column in default layout)
      'cellId1': String, // custom cell value
      'cellId2': { // using value mapping by `name`, will be converted to {'cellId': 'cellValue'}
        name: 'path.to.cell.value'
      },
      'cellId3': { // using render function
        render: 'Currency',
        name: 'path.to.cell.value',
        // data: 'value' will be added to object based on given `name` path
      },
      'cellId4': { // using recursive field Render
        view: 'Input',
        name: 'path.to.cell.value',
      },
    },
  ],
  renderItem: Object, // nested field definition to render after each Table item (row in default layout)
  filterItems: [ // used for nested tables within tables
    //  ╭ key path to value in this child-table's item to use for filtering
    {'state': 'state'},
    //           ╰ key path to value from parent-table's item to match against
  ],

  // Pie Chart
  // @see: <PieChart/> docs for other props
  mapItems: Object, // data mapper key/value pairs (ex. {label: 'pieLabelKeyFromData', value: 'pieValueKeyFromData'}

  // Upload and other input props
  kind: 'Type of file or input, for example, "images"',
  count: Number, // number of files/inputs
}
