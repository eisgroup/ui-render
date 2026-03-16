# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`eis-ui-render` is a React component library that generates UI from JSON schemas (meta + data). It takes a `meta.json` (UI structure/layout definition) and a `data.json` (values), and recursively renders a component tree. Published to npm as a UMD library, with a demo app hosted on GitHub Pages.

## Commands

- `npm start` — Run demo app in dev mode (webpack-dev-server)
- `npm run build` — Build the demo app for GitHub Pages deployment
- `npm run build-lib` — Build the publishable library to `dist/` (webpack + tsc)
- `npm run watch-lib` — Watch mode for library build
- `npm run yalc-publish` — Build lib and publish locally via yalc (for testing in consuming apps)
- `npm run yalc-watch` — Auto-rebuild and yalc-publish on src changes
- `npm run deploy` — Deploy demo to GitHub Pages (run `build` first)
- `npm test` — Run Jest tests
- `npm run test:watch` — Run Jest in watch mode
- `npm run build-css` — Standalone CSS build (LESS → PostCSS prefixwrap → CSS)
- `npm run lint:css` — Lint LESS files with stylelint

## Architecture

### Dual build targets

1. **Library** (`src/library/`) — Entry point `src/library/index.js`, built via `webpack.library.config.mjs` to `dist/`. Exports the `UIRender` component as UMD. React is externalized. CSS compiled from LESS and output to `dist/static/ui-render.css`.
2. **Demo app** (`src/demo/`) — Entry point `src/index.js` → `src/App.jsx`, built via `webpack.demo.config.mjs`. Used for development and GitHub Pages demo.

### Core rendering engine (`src/core/ui-render/`)

- `Render.js` — The recursive renderer. Takes props from meta definitions and renders components via `Render.Component` (component resolver) and `Render.Method` (render function resolver). These are set up in `mapper.js`.
- `transforms.js` — `metaToProps()` recursively converts meta.json declarations into React props. `mapProps()` maps data arrays using mapper definitions.

### Component/method mapping (`src/core/pages/main/`)

- `mapper.js` — Configures `Render.Component` and `Render.Method`. Maps `view` strings (e.g., `"Row"`, `"Table"`, `"Dropdown"`) to actual React components, and `render*` strings to value formatting functions.
- `rules.js` — The main UIRender component with form handling (react-final-form), data processing, validation, actions (submit, download, upload, addData, removeData), and lifecycle management.
- `utils.js` — Data transformation helpers (error mapping, normalization, form data extraction).

### Webpack path aliases

These aliases are defined in both `webpack.demo.config.mjs` (dev) and `webpack.library.config.mjs` (library build):

| Alias | Path |
|---|---|
| `ui-modules-pack` | `src/core/modules` |
| `ui-react-pack` | `src/core/components` |
| `ui-utils-pack` | `src/core/utils` |

All internal imports use these aliases rather than relative paths.

### Key internal packages

- **`ui-react-pack`** (`src/core/components/`) — Presentational components (Button, Dropdown, Table, Row, View, Input, Select, etc.) built on Semantic UI React.
- **`ui-utils-pack`** (`src/core/utils/`) — Pure utility functions (array, object, string, number, codec, storage helpers).
- **`ui-modules-pack`** (`src/core/modules/`) — Higher-level modules: form integration (react-final-form wrappers), upload handling, variable/field definitions (`FIELD.TYPE`, `FIELD.RENDER`, `FIELD.ACTION`).

### Meta/Data JSON contract

The UI is driven by two JSON inputs:
- **meta.json** — Declares the component tree: `view` (component type), `items` (children), `name` (data binding path), `render*` (value formatters), `showIf` (conditional rendering), validation rules, etc.
- **data.json** — Flat or nested data object. Values are resolved via dot-path from `name` fields in meta.

Examples live in `src/demo/examples/` (e.g., `example_meta.json` / `example_data.json`).

### Context and providers

- `ConfigContext` (`src/core/contexts/`) — Provides `dateFormat`, `currency`, `language` globally.
- `AppProvider` (`src/core/providers/`) — Wraps the library export with context providers.

## Tech Stack

- React 16 (peer dependency), Semantic UI React for base components
- react-final-form for form state management
- recharts for charts, dayjs/moment for dates
- LESS for styling, compiled via webpack (entry: `src/style/index.less`). Semantic UI theme overrides at `src/style/override/`. PostCSS prefixwrap scopes all CSS under `.ui-render`. Requires Less 3.x for `less-plugin-functions` compatibility.
- Node.js v24 (see `.nvmrc`)
- ESLint with `react-app` config (configured in package.json)
- Jest + @testing-library/react for tests
- stylelint for LESS linting (config: `.stylelintrc.json`)
