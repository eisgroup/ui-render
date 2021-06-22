### Table of Contents

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
