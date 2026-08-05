### Table of Contents

## Prerequisites

To understand and work with the UI Render, basic understanding of HTML and CSS is required:
- [What is HTML?](https://www.w3schools.com/whatis/whatis_html.asp)
- [What is CSS?](https://www.w3schools.com/whatis/whatis_css.asp)


## Peer dependencies

The host application is responsible for installing the following packages — they are declared as
**peer dependencies** so the library and the application share a single instance of each:

- `react` `^16.14.0 || ^17.0.0`
- `react-dom` `^16.14.0 || ^17.0.0`
- `moment` `^2.29.4`

Why this matters:

- **React / React DOM.** Two copies of React in the same tree throw `Invalid hook call` and break
  every Context provider — forms register fields against one instance while the renderer reads
  from another. This is a hard runtime failure, not a warning.
- **Moment.** The library build externalizes Moment and uses it for date pickers and formatters.
  The host must therefore provide a compatible 2.x version directly.

If the project uses **pnpm** with `auto-install-peers=false`, missing peer dependencies are not
auto-installed and must be added explicitly to the host `package.json`. pnpm in its default
isolated linker mode does not satisfy a peer through a transitive copy brought in by another
dependency — only direct declarations count.

Install command for consumers:

```bash
npm install eis-ui-render react@^17.0.0 react-dom@^17.0.0 moment@^2.29.4
```

```bash
pnpm add eis-ui-render react@^17.0.0 react-dom@^17.0.0 moment@^2.29.4
```

React 16.14 remains supported. Existing hosts may keep matching React and React DOM 16.14
dependencies until they are ready to upgrade.


## Overview

The UI Render is a declarative dynamic [React](https://reactjs.org/) component that is capable of rendering almost any user interface, in any platform (web, mobile, desktop, etc.).

User can interact with the generated UI as if it's a normal web page (or scene view in mobile apps): click/touch on links, select from dropdowns, submit forms, etc.

It works by receiving two configuration files:
- [data.json](#datajson): contains data for all values displayed in the UI (text, label, input, etc.)
- [meta.json](#metajson): contains UI configuration on how to render the data visually (Button, Table, Pie chart, etc.)


## Data.json

The `data.json` file can be in any form or shape. This file should only contain data values. 

Data values should be [normalised](https://docs.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description), because the UI Render does not have any logic related to data, thus, it does not understand structured data.

You can, however, write complex logic related to structured data within the `meta.json` configuration file.

## Meta.json

The `meta.json` file is responsible for the Look & Feel of the UI, as well as `data mapping` between `data.json` and rendered React components.

The illustration below demonstrates the structure of UI components, and their shape in the `meta.json` file:

![ui-architecture](static/images/ui-architecture.png)

It must start with a single `Root` Field object. Within each Field object, you can define nested Fields, under the attribute `items` - an array of nested child objects.

## React Component

A React component is a predefined component that the UI has available to display given data. 
It is configured by specifying the `view` along with other component attributes.
For example: `{"view": "Table"}` will use Table as the React Component.

Please refer to [configuration](configuration) and [styles](styles) for available options to customise React Components, as well, as the [FAQ](faq) section.

If you need a custom React component that does not yet exist in the [examples](examples), please submit a ticket to request new feature from the developer.

## Testing

You can play around with configurations by uploading `data.json` and `meta.json` files [here](demo).
