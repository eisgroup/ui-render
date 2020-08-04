## Table of Contents

## What is `view`?
`view` is equivalent to field ID - used for identifying which UI component to use for rendering.

The reason it is not called `id` is because in HTML, `id` attribute is used for uniquely identifying an element on a page.

## What is `render`?
Field attributes starting with the word `render...` are used as function or field definition for displaying certain parts of a UI component. For example, in `Table` view, there is `renderCell` attribute used for customizing how value in each cell should be displayed (e.x. `renderCell: "Currency"` will render float numbers as currency with dollar sign, keeping a maximum of two decimal points).

## What is `children`?
`children` is nested content to render inside a field, it can be any data type (string/number/function).

`children` and `items` are almost aliases, the difference being that `items` is a list of nested components, while `children` is a single nested component, or a `string/number` value.

`children` is primarily used for rendering custom content inside a field without having to fully declare them as nested UI components.

##  What is `className`?
`className` is HTML's `class` attribute used for adding CSS class names (as strings) to an HTML element. 

It is called `className`, instead of `class`, because the UI is written in JavaScript, which reserves the word `class` as a language keyword.

## What style is responsible for `$` or `%` display in table cells?
`renderCell: "Currency"` -> outputs number as currency with $ sign.
`renderCell: "Percent"` -> outputs number as percent with % sign.
