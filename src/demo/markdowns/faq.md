### Table of Contents

## How to check UI Render version?

1. In Chrome browser on your desktop computer (laptop), right click anywhere inside UI Render
2. Choose "Inspect"
   ![ui-render-inspect](/ui-render/static/images/ui-render-inspect.png)
3. Under `Elements` tab, search (press Ctrl + F for Windows, or Cmd + F for Mac) and type `ui-render`.
   ![ui-render-version](/ui-render/static/images/ui-render-version.png)
   The UI Render version is `data-version` attribute in the corresponding node of DOM.

## What is `view`?

`view` is equivalent to field ID - used for identifying which UI component to use for rendering.

The reason it is not called `id` is because in HTML, `id` attribute is used for uniquely identifying an element on a
page.

## What is `render`?

Field attributes starting with the word `render...` are used as function or field definition for displaying certain
parts of a UI component. For example, in `Table` view, there is `renderCell` attribute used for customizing how value in
each cell should be displayed (e.x. `renderCell: "Currency"` will render float numbers as currency with dollar sign,
keeping a maximum of two decimal points).

## What is `children`?

`children` is nested content to render inside a field, it can be any data type (string/number/function).

`children` and `items` are almost aliases, the difference being that `items` is a list of nested components,
while `children` is a single nested component, or a `string/number` value.

`children` is primarily used for rendering custom content inside a field without having to fully declare them as nested
UI components.

## What is `className`?

`className` is HTML's `class` attribute used for adding CSS class names (as strings) to an HTML element.

It is called `className`, instead of `class`, because the UI is written in JavaScript, which reserves the word `class`
as a language keyword.

## What style is responsible for `$` or `%` display in table cells?

`renderCell: "Currency"` -> outputs number as currency with $ sign.
`renderCell: "Percent"` -> outputs number as percent with % sign.

## How to set custom CSS styles?

The recommended way to style a component is to use the UI Render's built in styles, calling them by name as a string,
via the `className` attribute.
Example: `{className: "padding border"}` -> add standard padding and border to a Field.

Custom CSS styling can be set by directly writing CSS in [React way](https://reactjs.org/docs/faq-styling.html) via
the `style` attribute.
Example: `{style: {color: "rgba(255, 255, 255, 0.30)", backgroundColor: "red"}}`

## How to conditionally render Text/Title for `null` or empty value?

If you want to leave the field empty when its value is `null` or `undefined`, add attribute `{"renderLabel": "Float"}`
or `{"renderLabel": "Title+Input"}`.
If no value is provided for label at all, use `{"renderLabel": "String"}`

## How to format `extraItems` in Table?

```json
{
  "extraItems": [
    {
      "Description": "Eligible Lives",
      "Core": {
        "view": "Text",
        "label": {
          "name": "Plans.{state.plan,0}.Coverages[0].NumberOfEligible",
          "relativeData": false
        },
        "renderLabel": {
          "name": "Percent",
          "decimals": 2
        }
      },
      "BuyUp": {
        "name": "Plans.{state.plan,0}.Coverages[1].NumberOfEligible",
        "relativeData": false
      }
    }
  ]
}
```

## How to set table column width?

```json
{
  "view": "Table",
  "name": "path.to.data",
  "colGroup": [
    {
      "style": {
        "minWidth": "200px"
      }
    }
  ]
}
```

## How to freeze column on the left side of the table

```json
{
  "view": "Table",
  "name": "path.to.data",
  "colGroup": [
    {
      "isFixed": true,
      "style": {
        "minWidth": "150px"
      }
    },
    {
      "isFixed": true,
      "style": {
        "minWidth": "100px"
      }
    }
  ]
}
```

## Why Text component does not show `children` or `label`?

Do not simultaneously define `renderLabel` attribute as empty object or object with `null` values, because the rendering
priority is this:
`renderLabel` > `items` > `children` > `label`.
You can, however, retrieve `children` or `label` value dynamically, then use `renderLabel` to format that value.
Example:

```json
{
  "view": "Text",
  "label": {
    "name": "path.to.number.value.from.data.json",
    "relativeData": false
  },
  "renderLabel": {
    "name": "Percent",
    "decimals": 2
  }
}
```

## How to set options for Dropdown field in `renderExtraItem` area
In `meta.json` you have to set `"relativeData": false` to receive options from `data.json` root
```json
{
   "renderExtraItem": {
      "view": "Data",
      "embedded": true,
      "relativeData": false,
      "meta": {
         "view": "TableCells",
         "items": [
            {
               "view": "Select",
               "name": "periodName",
               "options": {
                  "name": "experienceRatingInputs.periodNameList"
               },
               "mapOptions": {
                  "text": "periodName",
                  "value": "periodName"
               }
            }
         ]
      }
   }
}
```
```js
const dataJson = {
   "experienceRatingInputs": {
      "dataKind": [], // Options should not to store here. `dataKind` can be epmty
      "periodNameList": [
         {
            "periodName": "Current Period"
         },
         {
            "periodName": "First Prior Period"
         },
         {
            "periodName": "Second Prior Period"
         },
         {
            "periodName": "Third Prior Period"
         }
      ]
   }
}
```

## How to format input number output
`decimals` - define how many fractional digits to show

`percentage` - add percent char

`separateThousands` - separate thousands in big numbers. Don't work with `percentage`
```json
{
   "view": "Input",
   "name": "calculatedWeight",
   "type": "number",
   "outputFormat": {
      "decimals": 2,
      "percentage": true
   }
}
```
```json
{
   "view": "Input",
   "name": "calculatedWeight",
   "type": "number",
   "outputFormat": {
      "decimals": 2,
      "separateThousands": true
   }
}
```