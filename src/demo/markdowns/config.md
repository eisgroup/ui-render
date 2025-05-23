### Table of Contents

## The Pattern Driven Design

The UI Render takes a conceptually different approach from most UI frameworks you may be familiar with (ex. Bootstrap,
Material Design, Ant Design...).

Like most frameworks, it has `built-in UI components`, such as Button, Table, Dropdown, etc. - with different set of
attributes available for each.

However, instead of being limited to what built-in components can do, you have complete freedom to mix them in any way
you like. Similar to building something from Lego.

The freedom of configuration comes from UI Render's `transform patterns`.
These patterns allow you to turn static `meta.json` files into dynamic configurations, by transforming attributes on the
fly.

In short, the UI Render is both declarative and dynamic in nature, with the possibility of `unlimited customisation`.

## Transform Patterns

1. **Recursive Field definition**
  - A Field can be any component, identified by `view` attribute, such as: Row, Button, Table, Dropdown, Piechart...
  - Objects with `view` attribute can have other Fields nested inside `items` attribute.

2. **Dynamic State**
  - Besides `data.json`, you can use dynamic `state` when configuring `meta.json`
  - You can create new or update existing state using `functions` (see point 8):
    Example of setting active plan using `onChange` function: `"onChange": "setState,plan"`
  - To read the state, define `name` attribute with key path like this:
    `"name": "plan.{state.plan,0}"` (next point explains how this works)
  - For advanced config, see the [example](#component-attributes) of Dropdown `onChange` attribute

3. **Curly Brace Transform**
  - The curly brace surrounding a key path will replace it with value found in `data.json` or in `state`
    Example: `"name": "plan.{state.plan}.title"` -> becomes `"name": "plan.undefined.title"`
  - Fallback value can be defined after a comma, to avoid `undefined` value on initialization
    Example: `"name": "plan.{state.plan,0}.title"` -> falls back to `"name": "plan.0.title"`

4. **Value Transform (for objects with a single attribute "name" and optional "relativeData")**
  - Example: `"title": { "name": "{key}" }` -> becomes `"title": "relative value"`
  - Example: `"title": { "name": "{key}", relativeData: false }` -> becomes `"title": "root value"`
  - Curly brace transform of the `{key}` attribute will happen first in above examples
  - See point 7 for the explanation of how `relativeData` works

5. **Data Mapping (by key paths)**
  - Use this to link attributes within `data.json` or `state` to attributes required by the component
  - You can define data mappers as object or string:
    a) `Object` example: `"mapOptions": {"component.attribute": "data.or.state.key.path"}`
    b) `String` example: `"mapOptions": "planName"` -> use `planName` attribute as options value
  - See the [example](#component-attributes) of `mapItems` and `mapOptions`

6. **Custom Rendering (by matching values)**
  - See the [example](#component-attributes) of `renderCell: { values: {...} }` in Table view
  - Default function can be defined when no value matches
    Example: `"renderCell": { "default": "Currency" }`

7. **Relative Data**
  - When you specify the `name` attribute of a Field, it retrieves values from local `data.json` object by default
  - Local Data is passed down (inherited) from parent/grandparent/etc. fields.
  - Use `{"relativeData": false}` to make `name` attribute retrieve values from global (root `data.json`)
  - Example:
    ```js
    const localData = {
      view: "GrandParent",
      name: "path.to.item.0",
      items: [
        {
          view: "Parent",
          name: "plan.0", // => this will resolve to "root.path.to.item.0.plan.0"
          items: [
            {
              view: "Child",
              name: "id", // => this will resolve to "root.path.to.item.0.plan.0.id"
            },
            {
              view: "Child",
              name: "id", // => this will resolve to "root.path.to.item.0.plan.0.id"
              relativeData: true,
            },
            {
              view: "Child",
              name: "id", // => this will resolve to "root.id"
              relativeData: false,
            }
          ]
        }
      ]
    }
    ```

8. **Function definitions**
  - A Function gives you a way to format data for display in the UI (ex. `Currency`, `Float`, `Percent`...)
  - A Function can be defined using `['onClick', 'onChange', 'onDone']` attributes, or starting with the word `render`
    Example: `renderLabel`, `renderCell`...
  - Function can be defined as `String`, with arguments separated by comma/s
    Example: `"setState,plan"` -> use `setSate` function with `plan` as argument
  - Function can be defined as `Object`
    Example:
    ```js
      {
        name: "fetch",
        args: [
          "https://url.to.fetch.com/api",
          {
            method: "POST",
            ...
          }
        ]
      }
    ```
  - Functions can perform complex UI logic by chaining with nested definitions.
    However, this requires coding skills. It is better to ask a developer (if you are not) for such cases.
    Example:
    ```js
      {
        name: "fetch",
        onDone: {
          name: 'fetch',
          mapArgs: [ // function will first receive `mapArgs`, then followed by `args`, as arguments
            // variable `{0.payload.ip}` can be defined to get data from arguments, in addition to *_data.json
            'https://ipapi.co/{0.payload.ip}/json', // this is the first argument passed to the function
            // ...second (subsequent) argument/s can be defined as object/array/number/etc.
          ],
          onDone: {
            name: 'popup',
            args: ['Dropdown.onChange\n -> fetch(IpAddress).onDone\n -> fetch(GeoData).onDone\n -> popup'],
          }
        }
      }
    ```

## Component Attributes

```js
const Component = {
  // Root level attributes
  currencyCode: 'USD', // default currency code for displaying currency symbol (does not support by Input fields). Supported codes: 'USD', 'EUR', 'GBP'

  // Common attributes (available in all UI components)
  view: 'Col', // (required)* name of the React Component used to display this field
  items: [], // recursively nested fields
  children: 'Any', // nested content to render inside field
  onClick: Function, // example: `{onClick: 'setState,active.plan'}` - `setState` function with `active.plan` argument
  style: Object, // css style to apply
  className: 'CSS class name to apply',
  debug: Boolean, // whether to suppress certain erros related to incorrect data type, default is false in production
  showIf: "path.to.data.that.exists", // whether to render the component if given path resolves to `truthy` value
  showIf: { // object notation
    "name": "path.to.data.that.exists", // optional
    "relativeData": Boolean, // optional
    "equal": Any, // optional, value to match against, can also make `equal` an object like so `{name, relativeData}`
  },

  // Input attributes
  name: 'adminCosts.adminCategory', // (required for inputs)* path to field value within *_data.json
  label: 'Input label',
  placeholder: 'To appear inside empty input when focused',
  type: 'number', // 'checkbox', 'email', 'number', 'select', 'slider', 'text', 'textarea', 'toggle', etc. (HTML input types)
  icon: 'dollar', // icon css class name -> displays Icon inside Input
  lefty: Boolean, // whether to show icon on the left, default is on the right
  float: Boolean, // whether label should float above input when in focus
  disabled: Boolean, // disabled input
  readonly: Boolean, // read-only input, makes all nested fields disabled, with `readonly` css class applied
  removable: Boolean, // whether to show cross icon that sets input value to null when clicked
  format: String, // name of the format function
  normalize: String, // name of the normalizer function
  parse: String, // name of the parser function
  validate: String, // name of the validation function
  value: undefined, // controlled input value
  defaultValue: undefined, // to be used on init if `value` not set
  onChange: String, // name of the callback function for input value changes
  min: Number, // minimum value
  max: Number, // maximum value
  hint: 'Displayed as title text above input',
  info: 'Content to render when input is in focus',
  error: 'Content to render when input is invalid',
  autoSubmit: Boolean, // whether input should submit form on changes
  autoSubmit: { // second way to define auto submission with customized options
    delay: Number, // specify delay in milliseconds for input submission on changes, default is 200 milliseconds
  },

  // Dropdown/Select attributes (using react Semantic UI Dropdown)
  // Select is used for changing Input values, whereas Dropdown for changing UI state only
  compact: Boolean,
  multiple: Boolean,
  search: Boolean, // whether dropdown options are searchable
  options: [{ text: 'Label for Human', value: 'internal value' }],
  mapOptions: Object, // data mapper key/value pairs or string (ex. {value: "{index}", text: "planName"})
  value: { name: '{state.active.plan,0}' }, // dynamic config using `state`
  onChange: { // function defined as object
    name: 'setState', // function triggering state update
    args: ['active.plan'], // key path of the changed value in state
  },

  // Slider attributes
  step: Number, // slider increment
  pushable: Number, // minimum slider increments between two handles

  // Table attributes
  inverted: Boolean, // whether to style table in dark mode
  striped: Boolean, // whether to alternate background shade of items (rows in default layout)
  vertical: Boolean, // whether to render Table rows as columns (does not work with `renderItem`)
  headers: [ // headers are columns in default layout, used for configuring how to show each cell data under the header
    {
      id: String, // required cell id
      label: String || Number || { name: String },
      renderCell: String || Object, // name of render Function to use
    },
    {
      id: String,
      label: String || Number || { name: String },
      renderCell: { // dynamic rendering based on cell value
        values: {
          'value to match': {/* definition of nested fields to render */ }
        },
        default: String,
      }
    }
  ],
  extraHeaders: [ // additional header layers to be rendered above/before `headers`
    [ // layers will be rendered in the order they are defined -> this is the first level header
      {
        colSpan: 2, // span two `headers` columns
        label: String || Number || { name: String },
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
    { 'state': 'state' },
    //           ╰ key path to value from parent-table's item to match against
  ],
  group: { // matrix table data grouping
    by: { // required, common attribute for repeating set of items
      id: 'tier', // required
      label: Object, // must resolve to object of labels by `tier` value (ex. {"employee": "Employee/Spouse"})
    },
    header: { // required, common header to group items by
      id: 'ageBand', // required
    },
  },
  itemsExpanded: Boolean, // expand all Rows/Columns by default
  itemClassNames: [ // conditional class names for table items (rows in default layout)
    { // does not work when `vertical: true` because not possible to apply CSS across table rows
      id: String, // cell id to apply className to
      values: {
        'value to match': String // css className to apply
      },
    }
  ],
  sorts: [ // adds sorting icon in table headers
    {
      id: String, // id of the header item to enable sorting
      order: 0, // 0 = unsorted by default, 1 = sorted ascending by default, -1 = sorted descending by default
      sortKey: 'item.attribute.used.for.sorting' // optional
    },
  ],
  colGroup: [ // Create colgroup HTML node to define colunm styles
    {
      style: Object // CSS styles
    },
  ],
  usePagination: false, // whether to use pagination for table
  rowsPerPage: 20, // number of rows per page

  // Pie Chart attributes
  mapItems: Object, // data mapper key/value pairs (ex. {label: 'pieLabelKeyFromData', value: 'pieValueKeyFromData'}

  // Upload and other input attributes
  kind: 'Type of file or input, for example, "images"',
  count: Number, // number of files/inputs

  // AutoSubmit attributes
  delay: Number,  // specify delay in milliseconds for input submission on changes, default is 200 milliseconds
  partial: true, // whether to submit only changed values
  outputFormat: { // for Inputs with type 'number'
      decimals: number, // define how many fractional digits to show
      percentage: boolean, // add percent 
      separateThousands: boolean // separate thousands in big numbers. don't works with percentage attribute
  }
}
```

For a full list of values to use for `view` and formatting functions,
check [Field Definitions](https://github.com/ecoinomist/modules-pack/blob/master/src/variables/fields.js)
and [Form Input Definitions](https://github.com/ecoinomist/modules-pack/blob/master/src/form/constants.js).

### ShowIf Logic

![showIf-logic](/ui-render/static/images/showIf.png)
