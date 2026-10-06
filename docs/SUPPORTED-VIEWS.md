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

Props are documented separately: `docs/SUPPORTED-PROPS.md` covers the prop surface of the
three views the `semantic-ui-react` exit replaced — all three are in-house since §9.7-F1
step 3 part 2, and no file in `src` references the package any more. Every component's
props are also its exported TypeScript props type, and the meta contract the package
publishes is typed in `dist/contract.d.ts`.

## How a node is resolved

A node's `view` is dispatched by `Render.Component` in
`src/core/engine/mapper.tsx`: a `switch` handles the layout and display
views directly, and its `default` branch hands form fields to `renderField` in
`src/core/engine/components/renders.tsx`.

Two consequences worth knowing before authoring meta:

- **An unknown `view` is not an error.** It reaches `renderField`'s `default`,
  which renders `PlaceholderField`: a red box showing the `view` name followed by
  "field does not exist!" in place of the node. Every `view` in the second table
  below behaves the same way — the constant exists, but nothing dispatches it.
- **An unknown `render*` value is not an error either.** `Render.Method` falls
  back to rendering the value as plain text, so a misspelled renderer name looks
  like a deliberately unformatted value.

## Views — `view` (37)

### Resolved (37)

| `view` | Constant | Resolves to | Dispatched by | Description |
| --- | --- | --- | --- | --- |
| `AutoSubmit` | `FIELD.TYPE.AUTO_SUBMIT` | `AutoSave` | `mapper.tsx` switch | Renders no markup of its own and calls its `onChange` with the form values whenever they change, so `"onChange": "submit"` submits the form. `onChange` is required; `delay` debounces it, `partial` sends only changed values and `showLoader` overlays a spinner while saving. |
| `Button` | `FIELD.TYPE.BUTTON` | `Button` | `mapper.tsx` switch | Clickable button whose content comes from `items`, or from a plain `label` when there are no children. `onClick` takes an action name or an action object — see the action table below. |
| `Checkbox` | `FIELD.TYPE.CHECKBOX` | `Checkbox` | `mapper.tsx` switch | Standalone checkbox with an optional label, driven by the `value` and `onChange` props of the node. Presentational only — it registers no form value. Use `Toggle`, or `Input` with `type: "toggle"`, for a form-bound checkbox. |
| `Col` | `FIELD.TYPE.COL` | `View` | `mapper.tsx` switch | Vertical flex container that renders `items` as its children. Aliases: `Column`, `VerticalLayout`. |
| `ColList` | `FIELD.TYPE.COL_LIST` | `List` | `mapper.tsx` switch | Alias of `List`. |
| `Column` | `FIELD.TYPE.COL2` | `View` | `mapper.tsx` switch | Alias of `Col`. |
| `Counter` | `FIELD.TYPE.COUNTER` | `Counter` | `mapper.tsx` switch | Number that animates from `start` to `end` when it mounts. A change of `start`, `end`, `duration`, `delay` or `interval` runs the animation again. |
| `Data` | `FIELD.TYPE.DATA` | `Data` | `mapper.tsx` switch | Nested render instance: `meta` carries the nested declaration, `data` or `name` selects the values its views display, and `kind` groups sibling instances into one array for validation. Its fields belong to the parent's form, unless `useForm` gives it a form of its own; a `renderExtraItem` declaration sets `useForm`. Outside a table row its fields keep their own names, from the root of the form's values, whatever `name` selects: a field shows and writes the root's value at its name, and `getFormData` returns it there. A `useForm` form starts from the selected values, and `getFormData` still returns its fields at the root, under their names. With `localDraft` and a `TableCells` declaration it renders a draft row that keeps its values in local state until the row is added. Any falsy local value falls back to the root `data`, so the nested block still has an object to bind against. |
| `Dropdown` | `FIELD.TYPE.DROPDOWN` | `Dropdown` | `mapper.tsx` default branch | Option list that deliberately does not write a form value; its `onChange` is proxied so the handler receives the selected value alone. `mapOptions` maps each entry of `options`, usually bound to the data with `{name}`, onto an option. Use `Select` for the form-bound equivalent. |
| `Expand` | `FIELD.TYPE.EXPAND` | `Expand` | `mapper.tsx` switch | Expanding and collapsing section with a clickable title, taking `items` as the collapsed content. A `label`, or failing that a `name`, is promoted to `title` when no `title` is given. |
| `ExpandList` | `FIELD.TYPE.EXPAND_LIST` | `ExpandList` | `mapper.tsx` switch | One `Expand` per entry of the node data, titled by `renderLabel` and filled by `renderItem`. |
| `HorizontalLayout` | `FIELD.TYPE.ROW2` | `Row` | `mapper.tsx` switch | Alias of `Row`. |
| `HorizontalList` | `FIELD.TYPE.ROW_LIST2` | `List` | `mapper.tsx` switch | Alias of `RowList`. |
| `Icon` | `FIELD.TYPE.ICON` | `Icon` | `mapper.tsx` switch | Icon named by its font class, with `items` rendered as its children. |
| `Image` | `FIELD.TYPE.IMAGE` | `Image` | `mapper.tsx` switch | Image addressed by `name` plus optional `path`, or by a direct `src`. Without `src`, the `name` is lower-cased, with spaces turned into dashes, and read from `path`, which defaults to the host's `/static/images/`: the package ships no images. `alt` defaults to the `name` without its extension. |
| `Input` | `FIELD.TYPE.INPUT` | `InputField` | `mapper.tsx` default branch, `renderField` | Form-bound input whose `type` picks the widget. `type` of `select`, `slider`, `toggle` or `file` re-dispatches the node as `Select`, `SliderLabel`, `Toggle` or `Upload`; `number` and `date` stay `Input` and resolve to the number and date fields; `min`/`max` on a number install a range validator; an `icon` object is rendered recursively. |
| `Label` | `FIELD.TYPE.LABEL` | `Label` | `mapper.tsx` switch | A `<label>` element wrapping `items` as its children. |
| `List` | `FIELD.TYPE.LIST` | `List` | `mapper.tsx` switch | Renders the node data array through `renderItem` inside a vertical container. Aliases: `ColList`, `VerticalList`. `RowList` and `HorizontalList` are the horizontal form. |
| `PieChart` | `FIELD.TYPE.PIE_CHART` | `PieChart` | `mapper.tsx` switch | Pie chart drawn as an inline SVG donut from the node data. `mapItems` maps each datum onto the chart shape; `legends`, `pointers` and `sort` control labelling and order. |
| `Popup` | `FIELD.TYPE.POPUP` | `PopupContent` | `mapper.tsx` switch | Registers its `items` on the render instance under `id` and renders nothing in place; the content is mounted only when the `popupOpen` action opens it. An `id` containing `{...}` is kept as a template and interpolated at open time, so one declaration can serve many rows. The popup shows the node's `title` above its `items`; no other key of the node has an effect. |
| `ProgressSteps` | `FIELD.TYPE.PROGRESS_STEPS` | `ProgressSteps` | `mapper.tsx` switch | Step indicator whose items each carry `step`, `label` and `content`, any of which may itself be a view declaration. |
| `Row` | `FIELD.TYPE.ROW` | `Row` | `mapper.tsx` switch | Horizontal flex container that renders `items` as its children. Alias: `HorizontalLayout`. |
| `RowList` | `FIELD.TYPE.ROW_LIST` | `List` | `mapper.tsx` switch | Renders the node data array through `renderItem` inside a horizontal container. Alias: `HorizontalList`. Same component as `List`, with the `row` flag set. |
| `Select` | `FIELD.TYPE.SELECT` | `DropdownField` | `mapper.tsx` default branch, `renderField`, `Input` `type` | Form-bound option list. When `mapOptions.value` is something other than `{index}`, `onChange` is handed the option index instead of the value, so `{state.…}` paths and cascading selects keep working. |
| `SliderLabel` | `FIELD.TYPE.SLIDER` | `SliderField` | `renderField`, `Input` `type` | Form-bound slider with a label. Also reached from `view: "Input"` with `type: "slider"`. |
| `Space` | `FIELD.TYPE.SPACE` | `Space` | `mapper.tsx` switch | Empty spacer between sibling items. |
| `Table` | `FIELD.TYPE.TABLE` | `TableView` | `mapper.tsx` switch | Table with dynamic `headers`, optional sorting, pagination, column groups and a `renderCell` declaration per header. `group` pivots rows into grouped columns, `extraItems` appends computed rows, `filterItems` keeps only rows matching the parent row, and the node `name` is expanded to the full dot-path its row inputs register under. |
| `TableCells` | `FIELD.TYPE.TABLE_CELLS` | `Table.Cell` | `mapper.tsx` switch | Renders each entry of `items` inside its own table cell. Each cell inherits the row `relativePath` and `relativeIndex`, which is what keeps nested input names row-scoped (`path[0].field`, not `path.field`). |
| `TabList` | `FIELD.TYPE.TAB_LIST` | `TabList` | `mapper.tsx` switch | Tabs built from the node data array, labelled by `renderLabel` and filled by `renderItem`. |
| `Tabs` | `FIELD.TYPE.TABS` | `Tabs` | `mapper.tsx` switch | Tab strip whose items each carry a `tab` and a `content`, either of which may be a nested view declaration. Items are consumed as `{tab, content}` pairs, so a `view` on an item is ignored — the `view: "Tab"` that several example metas carry resolves to nothing at all. `childrenBeforeTabs` and `childrenAfterTabs` render outside the strip. |
| `Text` | `FIELD.TYPE.TEXT` | `Text` | `mapper.tsx` switch | Text node whose content comes from `items`, from `renderLabel`, from a plain `label`, or from the value at `name`. |
| `Title` | `FIELD.TYPE.TITLE` | `Text` | `mapper.tsx` switch | A `Text` node with the `h3` class prepended, for consistent headings. |
| `Toggle` | `FIELD.TYPE.TOGGLE` | `ToggleField` | `renderField`, `Input` `type` | Form-bound checkbox rendered as a toggle. Also reached from `view: "Input"` with `type: "toggle"`. |
| `Tooltip` | `FIELD.TYPE.TOOLTIP` | `Tooltip` | `mapper.tsx` switch | Tooltip whose body comes from `label` and whose trigger is a nested `children` or `items` declaration. A `label` is promoted to `content` when no `content` is given (`mapper.tsx`), and `content` is what the tooltip renders — it is an explicit alias for `title` that wins over it. Any node can also carry a `tooltip` attribute instead of using this view, and that attribute may be an object, whose properties are spread into the tooltip — narrowed at §9.7-F1 step 2 part 3 from the 45 names `semantic-ui-react` accepted to 13, with the 19 reachable-and-plausible ones warning once each in development. **Correction (step 2 part 1):** this entry once said `items` supplied the tooltip *body*; measured, `items` becomes the TRIGGER. **And a correction to that correction (step 2 part 3):** part 1 measured the `items` form as not rendering at all, because `semantic-ui-react` required the trigger to be exactly one element (`React.Children.only`) while `mapper.tsx` builds an array, so it threw and left the engine error diagnostic in the node's place. The in-house tooltip has no such restriction — the trigger is rendered as children, so `items` renders the trigger AND the tooltip. `UIRender.overlay-behavior.test.js` pins the new behaviour, in the test that pinned the old failure until it was flipped. **Opens on hover (after 500 ms) and on keyboard focus, NOT on click or tap** — the click gesture was dropped at step 2 part 3 because every tooltipped node owns its own `onClick`; see `docs/SUPPORTED-PROPS.md` under `dropped.on`. |
| `Upload` | `FIELD.TYPE.UPLOAD` | `UploadField` | `renderField`, `Input` `type` | Form-bound file upload with drag and drop, taking several files unless `multiple` is false. Also reached from `view: "Input"` with `type: "file"`. `formats` lists the accepted extensions; with neither `formats` nor a known `fileType`, any file is accepted. Uploading is wired to the host `uploadFile` API call through the `upload` action. |
| `VerticalLayout` | `FIELD.TYPE.COL3` | `View` | `mapper.tsx` switch | Alias of `Col`. |
| `VerticalList` | `FIELD.TYPE.COL_LIST3` | `List` | `mapper.tsx` switch | Alias of `List`. |

### Declared, but no resolver case (0)

A node using one of these renders the "field does not exist!" placeholder.
They are listed because the constants are exported and reachable, so meta
authors and IDE tooling do see them.

| `view` | Constant | Declared in | Description |
| --- | --- | --- | --- |

## Value renderers — `render*` (7)

Used as the value of any attribute whose name starts with `render`
(`renderCell`, `renderItem`, `renderLabel`, …). All of these are wired in
`Render.Method`; anything else falls back to plain text.

| `render*` value | Constant | Description |
| --- | --- | --- |
| `Currency` | `FIELD.RENDER.CURRENCY` | Number prefixed with a currency symbol, where `decimals` defaults to 2 and `symbol` to `$`. A non-numeric value renders nothing. Written as an object, `{"name": "Currency"}`, it takes the symbol from a `currencyCode` of its own, or else the root meta's, and ignores a `symbol`: `$` for `USD`, the default, `€` for `EUR`, `£` for `GBP`, and none for any other code. |
| `Date` | `FIELD.RENDER.DATE` | Value formatted as a date. An empty value renders nothing. |
| `Double5` | `FIELD.RENDER.DOUBLE5` | Number with exactly five decimal places, ignoring any `decimals` given. A non-numeric value renders nothing. |
| `Float` | `FIELD.RENDER.FLOAT` | Number with `decimals` decimal places. Without `decimals` it shows the integer part only, truncated rather than rounded. A non-numeric value renders nothing. |
| `Percent` | `FIELD.RENDER.PERCENT` | Number multiplied by 100 and suffixed with a percent sign, with `decimals` decimal places. Without `decimals` it shows the integer part only, truncated rather than rounded. A non-numeric value renders nothing. |
| `String` | `FIELD.RENDER.STRING` | Value as plain text. |
| `Title+Input` | `FIELD.RENDER.TITLE_n_INPUT` | Value as text inside a row. The name is historical: there is no input in the implementation, only the value as text. |

## Actions — `onClick` / `onChange` / `onDone` (13)

Given as a string (`"submit"`, or `"setState,active.tab"` to append arguments)
or as an object (`{name, args, mapArgs, onDone}`). Resolved through `FIELD.FUNC`.
A name that is not below stays an unresolved string rather than raising.

| Action | Constant | Registered in | Description |
| --- | --- | --- | --- |
| `addData` | `FIELD.ACTION.ADD_DATA` | `engine/rules.tsx` | Validates the nested form and appends its values as a new row of the parent instance `dataKind` array. Warns and does nothing when the node has no parent instance and form. |
| `download` | `FIELD.ACTION.DOWNLOAD` | `engine/rules.tsx` | Calls the host `downloadFile` API call with the first argument and saves the response as a file, named by the second argument when that is a non-empty string and by the first otherwise. Does nothing when the host supplies no `downloadFile`. With no name at all the browser names the saved file. A failure opens an error popup titled with the error message. |
| `fetch` | `FIELD.ACTION.FETCH` | `engine/rules.tsx` | The global `fetch`. |
| `onApplyPeriods` | `FIELD.ACTION.ON_APPLY_PERIODS` | `engine/rules.tsx` | Sends all form data to the host `updateExperienceData` API call and restarts the form with the normalized response. Does nothing when the host supplies no `updateExperienceData`. An empty response (`undefined`, `null`, `''`, `0`) leaves the data as it was; failures open an error popup. |
| `popup` | `FIELD.ACTION.POPUP` | `engine/rules.tsx` | Opens an alert popup with the given title and content. |
| `popupOpen` | `FIELD.ACTION.POPUP_OPEN` | `engine/rules.tsx` | Opens the content registered by a `Popup` node with the given `id`. Event arguments are filtered out, and the row index is forwarded so fields inside the popup address the row that opened it. Of an options object after the `id`, only `relativeIndex` and `relativePath` are read, for a template popup's row. |
| `removeData` | `FIELD.ACTION.REMOVE_DATA` | `engine/rules.tsx` | Removes the current row from the parent instance `dataKind` array through the parent form array mutator. Warns and does nothing when the node has no parent instance and form. |
| `reset` | `FIELD.ACTION.RESET` | `engine/rules.tsx` | Resets the form to its initial values. |
| `setState` | `FIELD.ACTION.SET_STATE` | `engine/rules.tsx` | Writes the incoming value into the render instance state at the path given as the argument, for example `setState,active.tab`. This is the channel `{state.…}` templates and `showIf` read; a `Dropdown` or `Select` with a `name` and no `onChange` gets `setState,<name>` installed automatically. |
| `submit` | `FIELD.ACTION.SUBMIT` | `engine/rules.tsx` | Submits the form, first merging the values of every nested `dataKind` instance into the payload. |
| `updateDataOnChange` | `FIELD.ACTION.UPDATE_DATA_ON_CHANGE` | `engine/rules.tsx` | Writes a changed primitive value into every property of the instance data whose key is the field `name`, at any depth. Marked in the source as a temporary solution; it ignores object values, and does nothing when called without a field object. |
| `upload` | `FIELD.ACTION.UPLOAD` | `engine/rules.tsx` | Sends the current form data without the file field, the first picked file and every picked file to the host `uploadFile` API call as `(serializedData, file, files)`, and restarts the form with the normalized response. Does nothing when the host supplies no `uploadFile`. An empty response (`undefined`, `null`, `''`, `0`) leaves the data as it was; a failure is logged, with no popup. |
| `warn` | `FIELD.ACTION.WARN` | `variables/fields.ts` | Logs the arguments with `console.warn`. |

## What this page does and does not guarantee

Guaranteed by the generator and its contract test: the three inventories are
complete, every string matches its constant, and the resolved/unresolved split
matches the resolver source. Add or delete a constant or a `case` and the check
fails until the page is regenerated.

Not guaranteed: the descriptions. They are curated prose, so a change to what a
view *renders* — as opposed to whether it resolves — will not fail anything. That
gap closes when the resolver becomes a registry table (UPGRADE-PLAN §9.3); until
then, treat the prose as reviewed documentation rather than a machine-checked fact.
