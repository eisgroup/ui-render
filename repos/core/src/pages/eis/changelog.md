### Table of Contents
### v0.24.1
#### New Example
- [Example: **Summary Box**](/docs/examples#summaryBox)

### v0.24.0
#### New Features
- [Example: **Matrix Table**](/docs/examples#tableMatrix) (+ [minimum config](/docs/examples#tableMatrixRequired) example)
- [Example: **Tabs Buttoned**](/docs/examples#tabsButtoned) (+ [Tabs](/docs/examples#tabs) default example)
- [Example: **showEmptyAs**](/docs/examples#tableExtraItems) attribute for Table (cell value must be `null` or empty string for it to work)
- **onClickIcon** callback added for Dropdown to remove/delete Select field
- Localised validation messages
- Updated chevron icons to the latest DSM style guide.
  
#### Documentation Improvements
- [FAQ: **How to check UI Render Version**](/docs/faq)
- Examples: clicking `Meta.json` or `Data.json` will download respective `json` files.
- Examples: clicking links to `examples#id` with hash, like [this](/docs/examples#all), automatically opens the example. 
  In the same way, you can link to an example directly by first expanding it, then copying URL in the browser.
- Tabs shown in [`/docs`](/docs) now sync with browser URL

#### Fixes
- Multiple Form instances for UI Render on the same page
- **removable** attribute shows delete icon inside Input  
- **readonly** state for all form fields no longer hides the input if it has value
- **onRemove** Input Field sets form value to null for the Input

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
