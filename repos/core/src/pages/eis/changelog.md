### Table of Contents

### vX.XX.X
#### New
- Added `translate` property which accept localization function
- Added `methods` property. Provided ability to add callback functions. This functions will be called on buttons with related `onClick` function names. For example:

#### **`meta.json`**
```json
{
  "view": "Button",
  "items": [
    {
      "view": "Text",
      "label": "Apply Periods"
    }
  ],
  "onClick": {
    "name": "onApplyPeriods"
  }
}
```
```jsx
<UIRender
  methods={{
    onApplyPeriods: this.onApplyPeriods,
  }}
/>
```
- Added `apiCalls` property for UI-Render component and `onApplyPeriods` listener for `Button` component. If `apiCalls` contain `updateExperienceData` method, it will be calls on click button with `onApplyPeriods` listener

### v0.27.2
#### Fixes
- `onDataChanged` is called on any input change

### v0.27.1
#### Fixes
- The name of validation constant has been changed to avoid build crashes in production.

### v0.27.0
#### New
- Added `getValidationErrors` listener. Returns list of active validation errors
- Added `updateDataOnChange` for Toggle component. Uses in Meta config to update data object. Allow to change UI state to show/hide form controls
- Added `getFormData` callback. Provided ability to get actual data state of UI-Render
- Added `onDataChanged` listener. It is called every time on forms are changed from initials values
#### Fixes
- Date Input is allow to enter 4 digits for the year field 
- Generate unique IDs for nested UI-Render instances

### v0.26.3
#### Fixes
- Extract changed form values for nested Data Components before submission - [example](examples#tableForm)

### v0.26.2
#### New
- [Toggle Input](examples#inputToggle)
- [Download File Template](examples#buttonDownload)
- [Popup Content](examples#popupContent)

#### Fixes
- fix Input delete icon not working for `border-on-hover`
- fix Input validation message not showing on Tab changes
- fix Input cursor jumping when using `format`
- fix Date `format`
- fix e2e tests

### v0.26.0
#### New
- Upload file Input + [example](examples#upload)

#### Updated
- Upgraded major dependencies

#### Fixes
- Input nested inside Table not getting correct index

### v0.25.4
#### New
- Multiple UIRender instances on a Page
- [Data Component](examples#tableForm) for rendering nested UIRender instances
- Complex validation with multiple validator methods using `verify` attribute (see Data Component for examples)
- `notWithinRange` validation (see Data Component for examples)
- Input for date (see Data Component for examples)
- [Example Rating Details config](examples#ratingDetails)
- Cypress End-to-End Tests for Examples
- UIRender can be used directly with `data/meta` JS objects
- Docs available on GitHub Pages.

#### Updated
- ShowIf logic docs
- UIRender developer integration README.md
- Policy production build bundle instructions

#### Fixes
- relativePath for inputs nested in lists
- Localised translations not resolving in production
- Increased API timeout to 1 minute for production build

### v0.24.2
#### Removed
- **showEmptyAs** example

### v0.24.1
#### New Example
- [Example: **Summary Box**](examples#summaryBox)

### v0.24.0
#### New Features
- [Example: **Matrix Table**](examples#tableMatrix) (+ [minimum config](examples#tableMatrixRequired) example)
- [Example: **Tabs Buttoned**](examples#tabsButtoned) (+ [Tabs](examples#tabs) default example)
- [Example: **showEmptyAs**](examples#tableExtraItems) attribute for Table (cell value must be `null` or empty string for it to work)
- **onClickIcon** callback added for Dropdown to remove/delete Select field
- Localised validation messages
- Updated chevron icons to the latest DSM style guide.
  
#### Documentation Improvements
- [FAQ: **How to check UI Render Version**](faq)
- Examples: clicking `Meta.json` or `Data.json` will download respective `json` files.
- Examples: clicking links to `examples#id` with hash, like [this](examples#all), automatically opens the example. 
  In the same way, you can link to an example directly by first expanding it, then copying URL in the browser.
- Tabs shown in [`docs`](/ui-render) now sync with browser URL

#### Fixes
- Multiple Form instances for UI Render on the same page
- **removable** attribute shows delete icon inside Input  
- **readonly** state for all form fields no longer hides the input if it has value
- **onRemove** Input Field sets form value to null for the Input

#### Removed
- **hideOnEmpty** attribute
  
### v0.23.1
#### Changes
- **showIf** can be empty object. The logic works like [this](configuration#showif-logic).
  

### v0.23.0

#### Breaking Changes
- **relativeData** pattern defaults to `true` if not defined. To use global data.json, do this:
  ```js
  { 
    "name": "path.to.data.json",
    "relativeData": false
  }
  ```
- [Show If condition example updated](examples#showIf)


### v0.22.0

#### New Features
- [Styles documentation](styles)
- [Configuration docs updated](configuration)
- [Show If condition](examples#showIf)
- **Truthy** evaluation: if a value used in `showIf` or `hideOnEmpty` matches listed values below, it is considered `empty` (i.e. **untruthy**):
    ```js
    const NON_TRUTHY_VALUES = [
        false,
        undefined,
        null,
        NaN,
        0,
        0.0,
        -0,
        +0,
        -0.0,
        +0.0,
        '',
        {},
        [],
    ]
    ```
    All other values are not empty (i.e. **truthy**) for evaluation when `equal` is undefined.

#### Bug Fixes
- **hideOnEmpty**: values listed above are now considered empty (i.e. **untruthy**)

#### Changes
- **hideOnEmpty** will be deprecated in the next release version
- Updated CSS styles to match latest EIS DSM style guide
- Refactored CSS variables and bundling process for Genesis UI Integration
- Refactored JS code bundling process for Genesis UI Integration
