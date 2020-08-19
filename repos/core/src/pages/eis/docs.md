### Table of Contents

## Overview

The UI Renderer is a declarative dynamic [React](https://reactjs.org/) component that is capable of rendering almost any user interface, in any platform (web, mobile, desktop, etc.).

User can interact with the generated UI as if it's a normal web page (or scene view in mobile apps): click/touch on links, select from dropdowns, submit forms, etc.

It works by receiving two configuration files:
- [data.json](#datajson): contains data for all values displayed in the UI (text, label, input, etc.)
- [meta.json](#metajson): contains UI configuration on how to render the data visually (Button, Table, Pie chart, etc.)


## Data.json

The `data.json` file can be in any form or shape. This file should only contain data values. 

Data values should be [normalised](https://docs.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description), because the UI Renderer does not have any logic related to data, thus, it does not understand structured data.

You can, however, write complex logic related to structured data within the `meta.json` configuration file.

## Meta.json

The `meta.json` file is responsible for the Look & Feel of the UI, as well as `data mapping` between `data.json` and rendered React components.

The illustration below demonstrates the structure of UI components, and their shape in the `meta.json` file:

![ui-architecture](/static/images/ui-architecture.png)

It must start with a single `Root` Field object. Within each Field object, you can define nested Fields, under the attribute `items` - an array of nested child objects.

## React Component

A React component is a predefined component that the UI has available to display given data. It is configured by specifying the `view` along with other component attributes (example: `{view: "Table"}` will use Table as the React Component). 

Please refer to [configuration](/docs/configuration) for available options to customise React Components, as well, as the [FAQ](/docs/faq) section.

If you need a custom React component that does not yet exist in the [examples](/docs/examples), please submit a ticket to request new feature from the developer.

## Testing

You can play around with configurations by uploading `data.json` and `meta.json` files [here](/demo).
