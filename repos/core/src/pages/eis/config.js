const field = {
  // Meta data
  view: 'FieldsInGroup', // * name of React Component used to render this field
  items: [], // recursively nested fields
  hint: 'Displayed as title text above input',
  readOnly: Boolean, // makes all nested fields disabled, with `readOnly` css class applied
  style: Object, // css style to apply
  className: 'CSS class name to apply',

  // Generic input props
  name: 'adminCosts.adminCategory', // * path to field value within *-data.json
  label: 'Input label',
  placeholder: 'To appear inside empty input when focused',
  type: 'number', // 'text', 'textarea', 'email', etc.
  unit: 'Input value unit label (e.x. "USD" for currency input)',
  icon: 'dollar', // icon css class name -> displays Icon inside input
  iconLeft: Boolean, // By default, icon is displayed to the right
  onChange: Function, // callback for input value changes
  float: Boolean, // whether label should float above input when in focus
  disabled: Boolean, // disabled input
  readonly: Boolean, // read-only input
  normalize: [Function], // redux-form input value normalizer function/s
  validate: [Function], // redux-form input value validation function/s
  value: undefined, // controlled input value
  defaultValue: undefined, // to be used on init if `value` not set
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
    {
      'cellId': String, // custom cell value
    },
    {
      'cellId1': { // using value mapping by `name`, will be converted to {'cellId': 'cellValue'}
        name: 'path.to.cell.value'
      }
    },
    {
      'cellId3': { // using render function
        render: 'Currency',
        name: 'path.to.cell.value',
        // data: 'value' will be added to object based on given `name` path
      },
    },
    {
      'cellId4': { // using recursive field Render
        view: 'Input',
        name: 'path.to.cell.value',
      },
    },
  ],

  // Pie Chart
  // @see: <PieChart/> docs for other props
  mapItems: Object, // data mapper key/value pairs (ex. {label: 'pieLabelKeyFromData', value: 'pieValueKeyFromData'}

  // Upload and other input props
  kind: 'Type of file or input, for example, "images"',
  count: Number, // number of files/inputs
}
