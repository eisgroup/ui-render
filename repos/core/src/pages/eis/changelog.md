### Table of Contents

### v0.24.0
#### New Features
- [FAQ: **How to check UI Render Version**](/docs/faq)
- [Example: **Matrix Table** configuration](/docs/examples#tableMatrix) (+ [minimum config](/docs/examples#tableMatrixRequired) example)
- [Example: **showEmptyAs** attribute for Table](/docs/examples#tableExtraItems) (cell value must be `null` or empty string for it to work)
- **onClickIcon** callback added for Dropdown to remove/delete Select field
- localised validation messages
- Clicking links to `Examples` with hash, like [this](/docs/examples#all), automatically opens the example. 
  In the same way, you can link to an example directly by first expanding it, then copying URL in the browser.

#### Fixes
- Multiple Form instances for UI Render on the same page
- **readonly** state for all form fields no longer hides the input
- **onRemove** Input Field sets form value to null for the Input
- Tabs shown in [`/docs`](/docs) now sync with browser URL

#### Removed
- **hideOnEmpty** attribute
  
### v0.23.1
#### Changes
- **showIf** can be empty object. The logic works like this:
  ![showIf-logic](/static/images/showIf.png)

### v0.23.0

#### Breaking Changes
- **relativeData** pattern defaults to `true` if not defined. To use global data.json, do this:
  ```js
  { 
    "name": "path.to.data.json",
    "relativeData": false
  }
  ```
- [Show If condition example updated](/docs/examples#showIf)


### v0.22.0

#### New Features
- [Styles documentation](/docs/styles)
- [Configuration docs updated](/docs/configuration)
- [Show If condition](/docs/examples#showIf)
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
