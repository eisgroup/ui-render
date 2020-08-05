### Table of Contents

## The Pattern Driven Design

The UI Renderer takes a conceptually different approach, unlike most UI frameworks you may be familiar with (ex. Bootstrap, Material Design, AntD...).

Similar to most frameworks, the UI Renderer provides `built-in UI components`, such as Button, Table, Dropdown, etc. - with different set of attributes available for each.

But instead of being limited to what built-in components can do, you are given complete freedom to mix and match different attributes within each UI component - or `Render Field`, as we call it.

There are `conceptual patterns` you can apply to any component. This is the secret sauce that enables the UI Renderer to be both declarative and dynamic in nature, allowing `unlimited configuration`.


## Conceptual Patterns

1. **Recursive Field definitions**
    - A Field can be any view or input component, such as Button, Table, Dropdown...
    - Objects with `view` attribute can have other fields nested inside `items` attribute.

2. **Function definitions by name**
    - A Function can be defined using attributes starting with the word `render`
      Example: `renderItem`, `renderLabel`...
    - Arguments can be defined, separated by comma
      Example: `"setState,plan"` -> use `plan` as argument

3. **Custom rendering by matching values**
    - See the [example](#render-field-attributes) of `renderCell: { values: {...} }` in Table view
    - Default function can be defined when no value matches
      Example: `renderCell: { default: "Currency" }`

4. **Data mapping by key paths**
    - See the [example](#render-field-attributes) if `mapItems` and `mapOptions`
    - String can be used as a mapper
      Example: `{mapOptions: "planName"}` -> use `planName` attribute as options value

5. **Dynamic definition with curly brace transform** 
    - The curly brace surrounding a key path will replace it with value found in `data.json` or in `state`
      Example: `{name: "{key}"}` -> becomes `{name: "value"}`
    - Fallback value can be defined after a comma
      Example: `{name: "{key,0}}"` -> falls back to `{name: "0"}`)

6. **Value transform for objects with a single attribute "name"** 
    - Example: `{title: {name: "{key}"}}` -> becomes `{title: "value"}`
    - Curly brace transform of the `{key}` attribute will happen first in the example

7. **State dependent config** 
    - Dynamic states are used to transform the `meta.json` config on each render
    - Define the function triggering state update as:
      `{name: "setState", args: ["state.key.path.to.set"]}` 
    - Then in the dynamic config, use curly brace transform with: 
      `{state.key.path.to.value}`
    - See the [example](#render-field-attributes) of Dropdown `onChange` attribute
 
## Render Field Attributes
```js
const RenderField = {

  // Common attributes (available in all UI components)
  view: 'Col', // (required)* name of the React Component used to display this field
  items: [], // recursively nested fields
  children: 'Any', // nested content to render inside field
  onClick: Function, // example: `{onClick: 'setState,active.plan'}` - `setState` function with `active.plan` argument
  style: Object, // css style to apply
  className: 'CSS class name to apply',

  // Input attributes
  name: 'adminCosts.adminCategory', // (required for inputs)* path to field value within *_data.json
  label: 'Input label',
  placeholder: 'To appear inside empty input when focused',
  type: 'number', // 'text', 'textarea', 'email', etc.
  unit: 'Input value unit label (e.x. "USD" for currency input)',
  icon: 'dollar', // icon css class name -> displays Icon inside Input
  lefty: Boolean, // whether to show icon on the left, default is on the right
  onChange: Function, // callback for input value changes
  float: Boolean, // whether label should float above input when in focus
  disabled: Boolean, // disabled input
  readonly: Boolean, // read-only input, makes all nested fields disabled, with `readonly` css class applied
  normalize: Function, // redux-form input value normalizer function/s
  validate: [Function], // redux-form input value validation function/s
  value: undefined, // controlled input value
  defaultValue: undefined, // to be used on init if `value` not set
  hint: 'Displayed as title text above input',
  info: 'Content to render when input is in focus',
  error: 'Content to render when input is invalid',

  // Dropdown attributes (using react Semantic UI Dropdown)
  compact: Boolean,
  multiple: Boolean,
  search: Boolean, // whether dropdown options are searchable
  options: [{text: 'Label for Human', value: 'internal value'}],
  mapOptions: Object, // data mapper key/value pairs or string (ex. {value: "{index}", text: "planName"})
  value: {name: '{state.active.plan,0}'}, // dynamic config using `state`
  onChange: { // function defined as object
    name: 'setState', // function triggering state update
    args: ['active.plan'], // key path of the changed value in state
  },

  // Slider attributes
  min: Number, // minimum value
  max: Number, // maximum value
  step: Number, // slider increment
  pushable: Number, // minimum slider increments between two handles

  // Table attributes
  // @see: <TableView /> docs for other props
  inverted: Boolean, // whether to style table in dark mode
  striped: Boolean, // whether to alternate background shade of items (rows in default layout)
  headers: [ // headers are columns in default layout, used for configuring how to show each cell data under the header
    {
      id: String, // required cell id
      label: String || Number || {name: String},
      renderCell: String || Object, // name of render Function to use
    },
    {
      id: String,
      label: String || Number || {name: String},
      renderCell: { // dynamic rendering based on cell value
        values: {
          'value to match': {/* definition of nested fields to render */}
        },
        default: String,
      }
    }
  ],
  extraHeaders: [ // additional header layers to be rendered above/before `headers`
    [ // layers will be rendered in the order they are defined -> this is the first level header
      {
        colSpan: 2, // span two `headers` columns
        label: String || Number || {name: String},
      }
    ]
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
  sorts: [ // adds sorting icon in table headers
    {
      id: String, // id of the header item to enable sorting
      order: 0, // 0 = unsorted by default, 1 = sorted ascending by default, -1 = sorted descending by default
      sortKey: 'item.attribute.used.for.sorting' // optional
    },
  ],

  // Pie Chart attributes
  // @see: <PieChart/> docs for other props
  mapItems: Object, // data mapper key/value pairs (ex. {label: 'pieLabelKeyFromData', value: 'pieValueKeyFromData'}

  // Upload and other input attributes
  kind: 'Type of file or input, for example, "images"',
  count: Number, // number of files/inputs

}
```