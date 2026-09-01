<!--
  GENERATED FILE — DO NOT EDIT. Run `npm run docs:views` to regenerate.
  Inventory and resolution status come from the FIELD constants and the resolver source;
  the prose comes from scripts/view-reference-curation.js. Generator: scripts/generate-view-reference.js.
-->

# Supported `view` types

Every name a `meta.json` may use: the `view` of a node, the value of a `render*`
attribute, and the action names accepted by `onClick`, `onChange` and `onDone`.

**This page is generated.** Editing it by hand is pointless — the contract test
regenerates it and fails on any difference. Run `npm run docs:views` after changing a
`FIELD` constant or a resolver `case`, and edit prose in `scripts/view-reference-curation.js`.

Props are documented separately: `docs/SUPPORTED-PROPS.md` covers the prop surface of
the three views still implemented by `semantic-ui-react` (`Table`, `Tooltip`, and
`Select`/`Dropdown`), which is the only place the supported props are enumerated today.

## How a node is resolved

A node's `view` is dispatched by `Render.Component` in
`src/core/pages/main/mapper.js`: a `switch` handles the layout and display
views directly, and its `default` branch hands form fields to `renderField` in
`src/core/pages/main/components/renders.js`.

Two consequences worth knowing before authoring meta:

- **An unknown `view` is not an error.** It reaches `renderField`'s `default`,
  which renders `PlaceholderField`: a red box showing the `view` name followed by
  "field does not exist!" in place of the node. Every `view` in the second table
  below behaves the same way — the constant exists, but nothing dispatches it.
- **An unknown `render*` value is not an error either.** `Render.Method` falls
  back to rendering the value as plain text, so a misspelled renderer name looks
  like a deliberately unformatted value.

## Views — `view` (46)

### Resolved (37)

| `view` | Constant | Resolves to | Dispatched by | Description |
| --- | --- | --- | --- | --- |
| `AutoSubmit` | `FIELD.TYPE.AUTO_SUBMIT` | `AutoSave` | `mapper.js` switch | Renders no markup of its own and submits the form whenever the values it watches change. `onChange` is required; `delay` debounces it, `partial` sends only changed values and `showLoader` overlays a spinner while saving. |
| `Button` | `FIELD.TYPE.BUTTON` | `Button` | `mapper.js` switch | Clickable button whose content comes from `items`, or from a plain `label` when there are no children. `onClick` takes an action name or an action object — see the action table below. |
| `Checkbox` | `FIELD.TYPE.CHECKBOX` | `Checkbox` | `mapper.js` switch | Standalone checkbox with an optional label, driven by the `value` and `onChange` props of the node. Presentational only — it registers no form value. Use `Toggle`, or `Input` with `type: "toggle"`, for a form-bound checkbox. |
| `Col` | `FIELD.TYPE.COL` | `View` | `mapper.js` switch | Vertical flex container that renders `items` as its children. Aliases: `Column`, `VerticalLayout`. |
| `ColList` | `FIELD.TYPE.COL_LIST` | `List` | `mapper.js` switch | Alias of `List`. |
| `Column` | `FIELD.TYPE.COL2` | `View` | `mapper.js` switch | Alias of `Col`. |
| `Counter` | `FIELD.TYPE.COUNTER` | `Counter` | `mapper.js` switch | Number that animates from `start` to `end` when it mounts. |
| `Data` | `FIELD.TYPE.DATA` | `Data` | `mapper.js` switch | Nested, independent render instance with its own form: `meta` carries the nested declaration, `data` or `name` selects its values, and `kind` groups sibling instances into one array for validation. Any falsy local value falls back to the root `data`, so the nested block still has an object to bind against. |
| `Dropdown` | `FIELD.TYPE.DROPDOWN` | `Dropdown` | `mapper.js` default branch | Option list that deliberately does not write a form value; its `onChange` is proxied so the handler receives the selected value alone. `mapOptions` builds `options` out of the node data. Use `Select` for the form-bound equivalent. |
| `Expand` | `FIELD.TYPE.EXPAND` | `Expand` | `mapper.js` switch | Expanding and collapsing section with a clickable title, taking `items` as the collapsed content. A `label`, or failing that a `name`, is promoted to `title` when no `title` is given. |
| `ExpandList` | `FIELD.TYPE.EXPAND_LIST` | `ExpandList` | `mapper.js` switch | One `Expand` per entry of the node data, titled by `renderLabel` and filled by `renderItem`. |
| `HorizontalLayout` | `FIELD.TYPE.ROW2` | `Row` | `mapper.js` switch | Alias of `Row`. |
| `HorizontalList` | `FIELD.TYPE.ROW_LIST2` | `List` | `mapper.js` switch | Alias of `RowList`. |
| `Icon` | `FIELD.TYPE.ICON` | `Icon` | `mapper.js` switch | Icon named by its font class, with `items` rendered as its children. |
| `Image` | `FIELD.TYPE.IMAGE` | `Image` | `mapper.js` switch | Image addressed by `name` plus optional `path`, or by a direct `src`. |
| `Input` | `FIELD.TYPE.INPUT` | `InputField` | `mapper.js` default branch, `renderField` | Form-bound input whose `type` picks the widget. `type` of `select`, `slider`, `toggle` or `file` re-dispatches the node as `Select`, `SliderLabel`, `Toggle` or `Upload`; `number` and `date` stay `Input` and resolve to the number and date fields; `min`/`max` on a number install a range validator; an `icon` object is rendered recursively. |
| `Label` | `FIELD.TYPE.LABEL` | `Label` | `mapper.js` switch | A `<label>` element wrapping `items` as its children. |
| `List` | `FIELD.TYPE.LIST` | `List` | `mapper.js` switch | Renders the node data array through `renderItem` inside a vertical container. Aliases: `ColList`, `VerticalList`. `RowList` and `HorizontalList` are the horizontal form. |
| `PieChart` | `FIELD.TYPE.PIE_CHART` | `PieChart` | `mapper.js` switch | Pie or donut chart drawn as inline SVG from the node data. `mapItems` maps each datum onto the chart shape; `legends`, `pointers` and `sort` control labelling and order. |
| `Popup` | `FIELD.TYPE.POPUP` | `PopupContent` | `mapper.js` switch | Registers its `items` on the render instance under `id` and renders nothing in place; the content is mounted only when the `popupOpen` action opens it. An `id` containing `{...}` is kept as a template and interpolated at open time, so one declaration can serve many rows. |
| `ProgressSteps` | `FIELD.TYPE.PROGRESS_STEPS` | `ProgressSteps` | `mapper.js` switch | Step indicator whose items each carry `step`, `label` and `content`, any of which may itself be a view declaration. |
| `Row` | `FIELD.TYPE.ROW` | `Row` | `mapper.js` switch | Horizontal flex container that renders `items` as its children. Alias: `HorizontalLayout`. |
| `RowList` | `FIELD.TYPE.ROW_LIST` | `List` | `mapper.js` switch | Renders the node data array through `renderItem` inside a horizontal container. Alias: `HorizontalList`. Same component as `List`, with the `row` flag set. |
| `Select` | `FIELD.TYPE.SELECT` | `DropdownField` | `mapper.js` default branch, `renderField`, `Input` `type` | Form-bound option list. When `mapOptions.value` is something other than `{index}`, `onChange` is handed the option index instead of the value, so `{state.…}` paths and cascading selects keep working. |
| `SliderLabel` | `FIELD.TYPE.SLIDER` | `SliderField` | `renderField`, `Input` `type` | Form-bound slider with a label. Also reached from `view: "Input"` with `type: "slider"`. |
| `Space` | `FIELD.TYPE.SPACE` | `Space` | `mapper.js` switch | Empty spacer between sibling items. |
| `Table` | `FIELD.TYPE.TABLE` | `TableView` | `mapper.js` switch | Table with dynamic `headers`, optional sorting, pagination, column groups and a `renderCell` declaration per header. `group` pivots rows into grouped columns, `extraItems` appends computed rows, `filterItems` keeps only rows matching the parent row, and the node `name` is expanded to the full dot-path its row inputs register under. |
| `TableCells` | `FIELD.TYPE.TABLE_CELLS` | `Table.Cell` | `mapper.js` switch | Renders each entry of `items` inside its own table cell. Each cell inherits the row `relativePath` and `relativeIndex`, which is what keeps nested input names row-scoped (`path[0].field`, not `path.field`). |
| `TabList` | `FIELD.TYPE.TAB_LIST` | `TabList` | `mapper.js` switch | Tabs built from the node data array, labelled by `renderLabel` and filled by `renderItem`. |
| `Tabs` | `FIELD.TYPE.TABS` | `Tabs` | `mapper.js` switch | Tab strip whose items each carry a `tab` and a `content`, either of which may be a nested view declaration. Items are consumed as `{tab, content}` pairs, so a `view` on an item is ignored — the `view: "Tab"` that several example metas carry resolves to nothing at all. `childrenBeforeTabs` and `childrenAfterTabs` render outside the strip. |
| `Text` | `FIELD.TYPE.TEXT` | `Text` | `mapper.js` switch | Text node whose content comes from `items`, from `renderLabel`, from a plain `label`, or from the value at `name`. |
| `Title` | `FIELD.TYPE.TITLE` | `Text` | `mapper.js` switch | A `Text` node with the `h3` class prepended, for consistent headings. |
| `Toggle` | `FIELD.TYPE.TOGGLE` | `ToggleField` | `renderField`, `Input` `type` | Form-bound checkbox rendered as a toggle. Also reached from `view: "Input"` with `type: "toggle"`. |
| `Tooltip` | `FIELD.TYPE.TOOLTIP` | `TooltipPop` | `mapper.js` switch | Hover popup taking `items`, or a nested `children` declaration, as its body. A `label` is promoted to `content` when no `content` is given. Any node can also carry a `tooltip` attribute instead of using this view. |
| `Upload` | `FIELD.TYPE.UPLOAD` | `UploadField` | `renderField`, `Input` `type` | Form-bound single file upload with drag and drop. Also reached from `view: "Input"` with `type: "file"`. Uploading is wired to the host `uploadFile` API call through the `upload` action. |
| `VerticalLayout` | `FIELD.TYPE.COL3` | `View` | `mapper.js` switch | Alias of `Col`. |
| `VerticalList` | `FIELD.TYPE.COL_LIST3` | `List` | `mapper.js` switch | Alias of `List`. |

### Declared, but no resolver case (9)

A node using one of these renders the "field does not exist!" placeholder.
They are listed because the constants are exported and reachable, so meta
authors and IDE tooling do see them.

| `view` | Constant | Declared in | Description |
| --- | --- | --- | --- |
| `Date` | `FIELD.TYPE.DATE` | `form/constants.js` | Declared for a standalone date field, but no resolver case handles it — author a date input as `view: "Input"` with `type: "date"`. The same `"Date"` string is also `FIELD.RENDER.DATE`, which does work as a `render*` value; only the `view` is unreachable. |
| `Dates` | `FIELD.TYPE.DATES` | `form/constants.js` | Declared for multiple date ranges with `from` and `to` times, but no resolver case handles it. |
| `Fields` | `FIELD.TYPE.MULTIPLE` | `form/constants.js` | Declared for several fields of the same type side by side, but no resolver case handles it. |
| `FieldsWithLevel` | `FIELD.TYPE.MULTIPLE_LEVEL` | `form/constants.js` | Declared for several fields of the same type each carrying a value on a predefined scale, but no resolver case handles it. |
| `Group` | `FIELD.TYPE.GROUP` | `form/constants.js` | Declared for a group of semantically related fields, but no resolver case handles it. |
| `Link` | `FIELD.TYPE.LINK` | `main/rules.js` | No resolver case handles it, and the constant carries no intent comment — the declaration is the only trace of it in the codebase. Documented as unverifiable rather than guessed at; there is nothing in the source that says what it was meant to render. |
| `Place` | `FIELD.TYPE.PLACE` | `form/constants.js` | Declared for a Google Places autocomplete field, but no resolver case handles it. |
| `UploadGrid` | `FIELD.TYPE.UPLOAD_GRID` | `form/constants.js` | Declared for multiple uploads in a grid layout, but no resolver case handles it. |
| `UploadGrids` | `FIELD.TYPE.UPLOAD_GRIDS` | `form/constants.js` | Declared for several upload grids of different kinds as separate tabs, but no resolver case handles it. |

## Value renderers — `render*` (7)

Used as the value of any attribute whose name starts with `render`
(`renderCell`, `renderItem`, `renderLabel`, …). All of these are wired in
`Render.Method`; anything else falls back to plain text.

| `render*` value | Constant | Description |
| --- | --- | --- |
| `Currency` | `FIELD.RENDER.CURRENCY` | Number prefixed with a currency symbol, where `decimals` defaults to 2 and `symbol` to `$`. A non-numeric value renders nothing. |
| `Date` | `FIELD.RENDER.DATE` | Value formatted as a date. An empty value renders nothing. |
| `Double5` | `FIELD.RENDER.DOUBLE5` | Number with exactly five decimal places, ignoring any `decimals` given. A non-numeric value renders nothing. |
| `Float` | `FIELD.RENDER.FLOAT` | Number with `decimals` decimal places. A non-numeric value renders nothing. |
| `Percent` | `FIELD.RENDER.PERCENT` | Number multiplied by 100 and suffixed with a percent sign. A non-numeric value renders nothing. |
| `String` | `FIELD.RENDER.STRING` | Value as plain text. |
| `Title+Input` | `FIELD.RENDER.TITLE_n_INPUT` | Value as text inside a row. The name is historical: there is no input in the implementation, only the value as text. |

## Actions — `onClick` / `onChange` / `onDone` (13)

Given as a string (`"submit"`, or `"setState,active.tab"` to append arguments)
or as an object (`{name, args, mapArgs, onDone}`). Resolved through `FIELD.FUNC`.
A name that is not below stays an unresolved string rather than raising.

| Action | Constant | Registered in | Description |
| --- | --- | --- | --- |
| `addData` | `FIELD.ACTION.ADD_DATA` | `main/rules.js` | Validates the nested form and appends its values as a new row of the parent instance `dataKind` array. Warns and does nothing when the node has no parent instance and form. |
| `download` | `FIELD.ACTION.DOWNLOAD` | `main/rules.js` | Calls the host `downloadFile` API call with the file name and saves the response as a file. Does nothing when the host supplies no `downloadFile`; failures open an error popup. |
| `fetch` | `FIELD.ACTION.FETCH` | `main/rules.js` | The global `fetch`. |
| `onApplyPeriods` | `FIELD.ACTION.ON_APPLY_PERIODS` | `main/rules.js` | Sends all form data to the host `updateExperienceData` API call and restarts the form with the normalized response. Does nothing when the host supplies no `updateExperienceData`; failures open an error popup. |
| `popup` | `FIELD.ACTION.POPUP` | `main/rules.js` | Opens an alert popup with the given title and content. |
| `popupOpen` | `FIELD.ACTION.POPUP_OPEN` | `main/rules.js` | Opens the content registered by a `Popup` node with the given `id`. Event arguments are filtered out, and the row index is forwarded so fields inside the popup address the row that opened it. |
| `removeData` | `FIELD.ACTION.REMOVE_DATA` | `main/rules.js` | Removes the current row from the parent instance `dataKind` array through the parent form array mutator. Warns and does nothing when the node has no parent instance and form. |
| `reset` | `FIELD.ACTION.RESET` | `main/rules.js` | Resets the form to its initial values. |
| `setState` | `FIELD.ACTION.SET_STATE` | `main/rules.js` | Writes the incoming value into the render instance state at the path given as the argument, for example `setState,active.tab`. This is the channel `{state.…}` templates and `showIf` read; a `Dropdown` or `Select` with a `name` and no `onChange` gets `setState,<name>` installed automatically. |
| `submit` | `FIELD.ACTION.SUBMIT` | `main/rules.js` | Submits the form, first merging the values of every nested `dataKind` instance into the payload. |
| `updateDataOnChange` | `FIELD.ACTION.UPDATE_DATA_ON_CHANGE` | `main/rules.js` | Writes a changed primitive value back into the instance data at the field `name`. Marked in the source as a temporary solution; it ignores object values. |
| `upload` | `FIELD.ACTION.UPLOAD` | `main/rules.js` | Sends the picked file together with the current form data to the host `uploadFile` API call and restarts the form with the normalized response. Does nothing when the host supplies no `uploadFile`. |
| `warn` | `FIELD.ACTION.WARN` | `variables/fields.js` | Logs the arguments with `console.warn`. |

## What this page does and does not guarantee

Guaranteed by the generator and its contract test: the three inventories are
complete, every string matches its constant, and the resolved/unresolved split
matches the resolver source. Add or delete a constant or a `case` and the check
fails until the page is regenerated.

Not guaranteed: the descriptions. They are curated prose, so a change to what a
view *renders* — as opposed to whether it resolves — will not fail anything. That
gap closes when the resolver becomes a registry table (UPGRADE-PLAN §9.3); until
then, treat the prose as reviewed documentation rather than a machine-checked fact.
