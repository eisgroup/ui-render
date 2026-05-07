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

### Root Level

```js
{
  currencyCode: 'USD', // default currency code for displaying currency symbol
                       // Supported codes: 'USD', 'EUR', 'GBP'
}
```

### Common Attributes

Available in all UI components:

```js
{
  view: 'Col',           // (required) name of the React Component used to display this field
  items: [],             // recursively nested fields
  children: 'Any',       // nested content to render inside field
  onClick: Function,     // ex: {onClick: 'setState,active.plan'}
  style: Object,         // CSS style to apply
  className: 'string',   // CSS class name to apply
  debug: Boolean,        // suppress certain errors related to incorrect data type
  showIf: "path.to.data.that.exists",  // render only if path resolves to truthy value
  showIf: {              // object notation
    name: "path.to.data.that.exists",
    relativeData: Boolean,
    equal: Any,          // value to match against
  },
}
```

### Input Attributes

```js
{
  name: 'adminCosts.adminCategory', // (required) path to field value within data.json
  label: 'Input label',
  placeholder: 'Appears inside empty input when focused',
  type: 'number',       // 'checkbox', 'email', 'number', 'select', 'slider', 'text', 'textarea', 'toggle', etc.
  icon: 'dollar',       // icon css class name
  lefty: Boolean,        // show icon on the left (default: right)
  float: Boolean,        // label floats above input when focused
  disabled: Boolean,
  readonly: Boolean,     // makes all nested fields disabled with readonly CSS class
  removable: Boolean,    // show cross icon that sets input value to null
  format: String,        // name of the format function
  normalize: String,     // name of the normalizer function
  parse: String,         // name of the parser function
  validate: String,      // name of the validation function
  value: undefined,      // controlled input value
  defaultValue: undefined, // used on init if value not set
  onChange: String,       // callback function name for input value changes
  min: Number,
  max: Number,
  hint: 'Title text above input',
  info: 'Content rendered when input is in focus',
  error: 'Content rendered when input is invalid',
  autoSubmit: Boolean,   // submit form on changes
  autoSubmit: {          // with customized options
    delay: Number,       // delay in ms, default 200
  },
  outputFormat: {        // for Inputs with type 'number'
    decimals: Number,    // fractional digits to show
    percentage: Boolean, // add percent sign
    separateThousands: Boolean, // separate thousands (not compatible with percentage)
  },
}
```

### Dropdown / Select Attributes

`Select` is used for changing Input values, `Dropdown` for changing UI state only.
Both support `{state.xxx}` interpolation — when a value is selected, it updates `state` automatically,
so dependent fields using `{state.fieldName,fallback}` in their paths will re-render with new data.

```js
{
  compact: Boolean,
  multiple: Boolean,
  search: Boolean,       // searchable options
  options: [{ text: 'Label', value: 'internal value' }],
  mapOptions: Object,    // data mapper (ex: {value: "{index}", text: "planName"})
  // Note: mapOptions.value = "{index}" stores selected value as String index.
  // Use a persistent key (e.g. mapOptions.value = "id") to keep value stable.
  value: { name: '{state.active.plan,0}' }, // dynamic config using state
  onChange: {
    name: 'setState',
    args: ['active.plan'],
  },
}
```

#### Select with Dynamic State (Cascading Selects)

Select fields now support `{state.xxx}` path interpolation, enabling cascading dependencies.
When a Select value changes, it automatically updates `state`, so dependent fields re-render.

Example: Category selection drives Product options:
```json
{
  "view": "Select",
  "name": "categoryX",
  "options": { "name": "Catalog.Categories", "relativeData": false },
  "mapOptions": { "text": "CategoryName", "value": "{index}" },
  "compact": true
}
```
Dependent Product Select uses `{state.categoryX,0}` to resolve the active category:
```json
{
  "view": "Select",
  "name": "productX",
  "options": {
    "name": "Catalog.Categories.{state.categoryX,0}.Products",
    "relativeData": false
  },
  "mapOptions": "Product",
  "compact": true
}
```

See the [Select: Cascading](#selectCascading) example for a working demo.

#### mapOptions — How Select Values Are Stored

`mapOptions` controls which data field is displayed as option text and what value is stored when the user makes a selection. The stored value affects form data on submit.

**Index-based (default)** — stores the position index of the selected option:

```json
"mapOptions": "categoryName"
```
Shorthand for `{ "text": "categoryName", "value": "{index}" }`.
Selected value in form data: `"0"`, `"1"`, etc.
On submit, `changeOptionOrderForSelectFields` moves the selected item to the front of the options array and **removes** the select field from the output data.

```json
"mapOptions": { "text": "categoryName", "value": "{index}" }
```
Explicit index-based — same behavior as the shorthand above.

**Stable value** — stores the actual data field value:

```json
"mapOptions": { "text": "categoryName", "value": "categoryCode" }
```
Selected value in form data: `"TECH"`, `"DESIGN"`, etc. (actual `categoryCode` values).
The select field **stays** in the output data with the real value. Options array is **not** reordered.

**When to use which:**

| Scenario | mapOptions | Stored value | Kept in output |
|---|---|---|---|
| UI state only (drive other fields via `{state.xxx}`) | `"fieldName"` or `{ text, value: "{index}" }` | Index (`"0"`) | No (removed on submit) |
| Persistent selection (value matters for backend) | `{ text: "label", value: "id" }` | Real value (`"HIGH"`) | Yes |

**Example: stable-value Select**

data.json:
```json
{
  "periodBasis": [
    { "periodBasisType": "Month" },
    { "periodBasisType": "Year" }
  ]
}
```

meta.json (index-based — default):
```json
{
  "view": "Select",
  "name": "periodBasisSelection",
  "options": { "name": "periodBasis" },
  "mapOptions": "periodBasisType"
}
```
→ Stores `"0"` or `"1"`. Removed from output on submit.

meta.json (stable-value):
```json
{
  "view": "Select",
  "name": "periodBasisSelection",
  "options": { "name": "periodBasis" },
  "mapOptions": { "text": "periodBasisType", "value": "periodBasisType" }
}
```
→ Stores `"Month"` or `"Year"`. Kept in output data.

### Slider Attributes

Drag-to-set numeric input with optional marks and tooltip. Use through `Input` with
`type: 'slider'`. Bind `value` to a number for a single handle, or to an array `[from, to]`
for a range slider.

```js
{
  view: 'Input',
  type: 'slider',
  name: 'path.in.data',     // bound value (number or [from, to])
  min: Number,              // lower bound (default 0)
  max: Number,              // upper bound (default 100)
  step: Number | null,      // movement increment; pass null to snap to mark points
  marks: {                  // explicit marks: { value: { style?, label? } }
    [Number]: { style: Object, label: String | Number },
  },
  range: [Number, ...],     // shorthand: auto-builds marks from a list of numbers
  rangeLabels: {            // formatting options when paired with `range`
    isCurrency: Boolean,
    currency: String,       // default '$'
    isPercent: Boolean,
    isTime: Boolean,        // formats milliseconds (`< 1000` → ms; otherwise human-readable)
    precision: Number,
    formatLabel: Function,  // (value) => string, overrides everything above
  },
  rangeOptions: [Number, ...], // explicit list of mark values (no auto-step computation)
  vertical: Boolean,        // render vertically
  disabled: Boolean,
  readonly: Boolean,
  tooltipProps: {           // when present, shows a tooltip on each handle
    render: Function | String, // optional value formatter (string maps to renders.js, e.g. 'Percent')
  },
  unit: String,             // appended to the default tooltip label, e.g. '%'
}
```

**Notes**

- Single mode is inferred when `value` is a number; range mode when it's an array of two numbers.
- In range mode, handles can swap by dragging past each other (the array is normalised on commit).
- Keyboard: `←/↓` and `→/↑` step by `step`; `Home`/`End` jump to `min`/`max`. With `step: null`
  arrows snap to the next/previous mark value.
- **Discrete mode** (when `step: null` *and* marks/`range` are provided): marks are distributed
  evenly along the track and the handle moves between equal visual segments. Numeric values are
  preserved on the API (so e.g. `[10, 50, 100, 500, 1000, 5000]` stays as those values), but
  visually they spread uniformly instead of clumping near the low end of a linear scale.
- `range: [10, 100, 500]` is a shortcut that becomes `min: 10`, `max: 500`, plus auto marks at
  the listed values (and intermediate computed steps when length is 2 or starts with 0).
- See the example "Slider (single, range, marks, percent, disabled)" for runnable variants.

### Table Attributes

```js
{
  inverted: Boolean,     // dark mode
  striped: Boolean,      // alternate background shade
  vertical: Boolean,     // render rows as columns (not compatible with renderItem)
  headers: [
    {
      id: String,        // required cell id
      label: String || Number || { name: String },
      renderCell: String || Object,
    },
    {
      id: String,
      label: String || Number || { name: String },
      renderCell: {      // dynamic rendering based on cell value
        values: { 'value to match': { /* nested field definition */ } },
        default: String,
      },
    },
  ],
  extraHeaders: [        // additional header layers rendered above headers
    [
      { colSpan: 2, label: String || Number || { name: String } },
    ],
  ],
  extraItems: [          // additional row definitions
    {
      'cellId1': String,
      'cellId2': { name: 'path.to.cell.value' },
      'cellId3': { render: 'Currency', name: 'path.to.cell.value' },
      'cellId4': { view: 'Input', name: 'path.to.cell.value' },
    },
  ],
  renderItem: Object,    // nested field definition rendered after each Table item
  filterItems: [         // for nested tables within tables
    { 'state': 'state' },
  ],
  group: {               // matrix table data grouping
    by: { id: 'tier', label: Object },
    header: { id: 'ageBand' },
  },
  itemsExpanded: Boolean, // expand all rows by default
  itemClassNames: [      // conditional class names for table items
    { id: String, values: { 'value to match': 'className' } },
  ],
  sorts: [               // sorting icon in table headers
    { id: String, order: 0, sortKey: 'item.attribute' },
  ],
  colGroup: [            // column styles (colgroup HTML element)
    { style: Object, isFixed: Boolean },
  ],
  usePagination: false,  // enable pagination (renders nav below the table when totalPages > 1)
  rowsPerPage: 20,       // rows per page (default 20)
}
```

**Pagination notes**

- Activated only when `usePagination: true` *and* the items count exceeds `rowsPerPage`. With a
  single page the nav is hidden.
- The control renders centered under the table with prev/next arrows, page numbers and ellipsis
  for skipped middle pages. Clicking a page scrolls the table back to its top.
- Pagination state is internal to the table; switching pages does not modify the bound `data.json`.
- See the example "Table with Pagination" for a runnable config.

### Pie Chart Attributes

Renders a donut chart from an array of `{label, value}` items. Supports optional legends, slice
pointers, sorting and gradient fills.

```js
{
  view: 'PieChart',
  name: 'path.to.array',  // data array bound to slices
  mapItems: Object,       // data mapper, e.g. {label: 'pieLabelKey', value: 'pieValueKey', order: 'sortKey'}
  height: Number,         // chart height in px (default: 290; width fills the parent)
  unit: String,           // unit shown next to value in tooltip (pluralized by value)
  gradient: Boolean,      // gradient fills for slices (default: true)
  pointers: Boolean,      // draw external pointers/labels on each slice; default true when no legends, false otherwise
  legends: Boolean | {    // render reference list of slices
    background: Boolean,  // background panel behind legend items (default: true)
    bottom: Boolean,      // place legends below the chart instead of right
    columns: Number,      // split legend items into N columns
  },
  sort: String | [String], // sort key(s) on projected items, prefix with '-' for descending (e.g. 'value', '-order')
  className: String,       // CSS class on the chart wrapper
  classNameWrap: String,   // CSS class on the chart+legends container (only when `legends` is set)
  items: [Field],          // optional fields rendered in the donut center (replaces the default Total)
}
```

**Item shape** — each entry of the bound array (after `mapItems` projection) must have at least:

```js
{
  label: String | Number,  // slice label (also used as legend text and slice name)
  value: Number,           // slice numeric value
  id: String,              // optional, used as slice name when present (must be unique per chart)
}
```

**Notes**

- Slices are drawn clockwise starting from the top (12 o'clock).
- `pointers: true` draws an outside text label with a pointer line; `pointers: false` keeps the
  percent label inside the slice.
- The center of the donut shows the sum of `value` across items by default. To replace it, nest
  components under `items` — they render inside the center.
- `mapItems` is a generic Data Mapping pattern (see Pattern 5); fields not used by `PieChart` (such
  as `order`) are still attached to projected items and can be referenced by `sort`.

### Upload Attributes

Single- or multi-file upload with click + drag&drop. Use through `Input` with `type: 'file'`
(the renderer maps it to the `Upload` field) or directly as `view: 'Upload'`.

```js
{
  view: 'Input',
  type: 'file',          // route to Upload field
  name: 'path.in.data',  // bound key in data.json (receives the File or File[])
  fileType: String,      // optional preset key resolved against UPLOAD.BY_ROUTE for default formats/maxSize
  formats: [String],     // accepted extensions, e.g. ['csv'] or ['png', 'jpg', 'webp']
  maxSize: Number,       // max file size in bytes (rejected with a popup if exceeded)
  multiple: Boolean,     // allow selecting multiple files (default: true)
  label: String,         // singular noun in the dropzone hint (pluralised when multiple)
  labelOnHover: String,  // overrides the hover hint text (otherwise "Upload <label> file")
  title: String,         // native tooltip on the dropzone
  showTypes: Boolean,    // show the formats hint on hover (default: true)
  hasHeader: Boolean,    // render an `<h2>Upload <label></h2>` above the dropzone
  round: Boolean,        // adds the `round` CSS class to the wrapper
  classWrap: String,     // CSS class on the outer wrapper (e.g. 'left' to align left)
  className: String,     // CSS class on the dropzone itself (e.g. 'button' for button style)
  styles: String,        // shorthand for additional CSS classes
  readonly: Boolean,     // disable interaction without greying out
  disabled: Boolean,     // disable interaction (greyed out)
  loading: Boolean,      // show spinner overlay while uploading
  autoSubmit: Boolean,   // submit the form automatically when a file is picked
  items: [Field],        // custom dropzone content (icon + text instead of the default hint)
  onChange: Function,    // (acceptedFiles, name) => void; receives an array of File objects
  onFocus: Function,     // fires when drag enters the zone or the file dialog opens
  onBlur: Function,      // fires on drag leave or when the file dialog is cancelled
}
```

**Validation behaviour**

- Files larger than `maxSize` are rejected and a popup appears with the file name and the
  allowed size.
- If the user picks a file outside the allowed `formats`, the file dialog filters it out client-
  side; a manual drop of an unsupported format triggers a "FILE_UPLOAD_FAILED" popup listing
  the allowed extensions.
- `multiple: false` makes the field accept exactly one file; `multiple: true` (default) accepts
  many — the `onChange` callback always receives an array.

**Notes**

- The dropzone toggles an `active` CSS class while a file is being dragged over it.
- Pressing **Enter** while focused on the dropzone opens the file dialog; cancelling it via
  the OS picker calls `onBlur` (uses the native `cancel` event with a focus-return fallback).
- See the examples "Upload" and "Upload: variants" for runnable configs.

### AutoSubmit Attributes

```js
{
  delay: Number,         // delay in ms, default 200
  partial: true,         // submit only changed values
}
```

For a full list of values to use for `view` and formatting functions,
check [Field Definitions](https://github.com/ecoinomist/modules-pack/blob/master/src/variables/fields.js)
and [Form Input Definitions](https://github.com/ecoinomist/modules-pack/blob/master/src/form/constants.js).

## Popup Component

The Popup component allows you to display modal dialogs with form fields. When used with Tables, popup fields automatically receive the correct `relativePath` and `relativeIndex` to ensure form field names match the table row that opened the popup.

### Basic Usage

```js
{
  view: 'Button',
  children: 'Open Popup',
  onClick: {
    name: 'popupOpen',
    args: ['popupId']
  }
},
{
  view: 'Popup',
  id: 'popupId',
  items: [
    {
      view: 'Input',
      name: 'fieldName',
      label: 'Field Label'
    }
  ]
}
```

### Using Popups with Tables

When opening a popup from a table row (using `renderItem`), the popup fields will automatically use the correct table row context. This ensures that input field names include the proper path and index.

**Example: Opening popup from table row**

```js
{
  view: 'Table',
  name: 'experienceRatingInputs.uwOverridesCoverage',
  headers: [
    { id: 'coverageType', label: 'Coverage Type' }
  ],
  renderItem: {
    view: 'VerticalLayout',
    items: [
      {
        view: 'Button',
        children: 'Override',
        onClick: {
          name: 'popupOpen',
          args: ['InforceRateOverrideReason.{index}']
        }
      },
      {
        view: 'Popup',
        id: 'InforceRateOverrideReason.{index}',
        items: [
          {
            view: 'Input',
            name: 'inforceRateOverride',
            // Becomes: "experienceRatingInputs.uwOverridesCoverage[0].inforceRateOverride"
            type: 'number',
            label: 'Inforce Rate Override'
          },
          {
            view: 'Input',
            name: 'inforceRateOverrideReason',
            label: 'Reason'
          }
        ]
      }
    ]
  }
}
```

### How It Works

1. **Popup ID with Template Variables**: Use `{index}` in the popup ID to create unique popups per row.

2. **Automatic Context Passing**: When a popup is opened from a table row, `relativePath` and `relativeIndex` are automatically passed to popup fields. Input field names are prefixed with the full path: `"{relativePath}[{relativeIndex}].{fieldName}"`.

3. **Form Field Names**: Each table row gets its own set of popup fields with correct path associations and independent validation.

### Important Notes

- Use `{index}` in the popup ID when opening from table rows
- Input fields inside popups automatically get the correct path prefix
- Popup fields receive the current row's data (`_data`) automatically
- Popups are centered on screen

## ShowIf Logic

![showIf-logic](static/images/showIf.png)
