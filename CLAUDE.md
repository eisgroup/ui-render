# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`eis-ui-render` is a React component library that generates UI from JSON schemas (meta + data). It takes a `meta.json` (UI structure/layout definition) and a `data.json` (values), and recursively renders a component tree. Published to npm as a UMD library, with a demo app hosted on GitHub Pages.

The modernization roadmap (React 17/18 upgrade, `semantic-ui-react` exit, project structure) lives in `docs/UPGRADE-PLAN.md`.

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

1. **Library** (`src/library/`) — Entry point `src/library/index.js`, built via `webpack.library.config.mjs` to `dist/`. Exports the `UIRender` component as UMD. `react`, `react-dom`, and `moment` are externalized (peer dependencies — the host app provides them). CSS is compiled from LESS and the real stylesheets, fonts and images ship **once** in the root `static/` folder — that is the payload hosts copy to their web root, because `FILE.PATH_IMAGES` resolves to `<homepage>/static/images/`. `dist/static/all.css` and `font.css` are one-line `@import` re-exports of it, so bundler imports of the dist path keep working; `semantic.css` is a 0-byte stub in both places. Packaging is gated by `npm run test:pack` (budgets + a packed-tarball server-render smoke) — never re-add an asset copy under `dist/static/`, the duplicate guard fails the build.
2. **Demo app** (`src/demo/`) — Entry chain `src/index.js` → `src/main.jsx` (ReactDOM.render) → `src/App.jsx`, built via `webpack.demo.config.mjs`. Used for development and GitHub Pages demo.

### Core rendering engine (`src/core/ui-render/`)

- `Render.js` — The recursive renderer. Takes props from meta definitions and renders components via `Render.Component` (component resolver) and `Render.Method` (render function resolver). These are set up in `mapper.js`.
- `transforms.js` — `metaToProps()` recursively converts meta.json declarations into React props. `mapProps()` maps data arrays using mapper definitions.

### Component/method mapping (`src/core/pages/main/`)

- `mapper.js` — Configures `Render.Component` and `Render.Method`. Maps `view` strings (e.g., `"Row"`, `"Table"`, `"Dropdown"`) to actual React components, and `render*` strings to value formatting functions.
- `rules.js` — The main UIRender component with form handling (react-final-form), data processing, validation, actions (submit, download, upload, addData, removeData), and lifecycle management.
- `utils.js` — Data transformation helpers (error mapping, normalization, form data extraction).

### Internal layering and imports

All internal imports use **relative paths** — there are no `ui-*-pack` webpack aliases (the only resolve aliases are `theme.config` for semantic-ui-less theming and `process`). The historical "pack" names survive as directory layers:

| Layer (historical name) | Path |
|---|---|
| `ui-react-pack` — presentational | `src/core/components` |
| `ui-modules-pack` — form/upload/fields | `src/core/modules` |
| `ui-utils-pack` — pure utils | `src/core/utils` |

Dependency direction (keep it one-way): `utils` imports nothing above it; `components` may import `utils`; `modules` may import `components`/`utils`; the engine (`pages/main` + `ui-render`) may import anything in core. `semantic-ui-react` may be imported **only** inside `src/core/components`.

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
- moment for dates (peer dependency, externalized); charts are custom SVG (`src/core/components/charts/` — no recharts)
- LESS for styling, compiled via webpack (entry: `src/style/index.less`). Semantic UI theme overrides at `src/style/override/`. PostCSS prefixwrap scopes all CSS under `.ui-render`. Less is pinned to 3.x (semantic-ui-less inline-JS + `less-plugin-functions` toolchain — see `docs/UPGRADE-PLAN.md` §9.8 before changing).
- Node.js v24 (see `.nvmrc`)
- ESLint with `react-app` config (configured in package.json). `lint:js` runs with `--max-warnings 0`, so a new warning fails CI — fix it, or suppress it with a comment stating why the rule is wrong. Never blanket-disable: one tolerated warning here turned out to be a real crash (see `docs/UPGRADE-PLAN.md` §11 R18).
- Babel config lives only in `babel.config.js` and is shared by the library build, the demo build and jest. Do not add `presets` to a `babel-loader` `options` block: a loader-level entry **replaces** the shared one for the same plugin identifier, silently dropping the shared options. Only demo-specific dev transforms (`react-refresh/babel`) belong inline.
- Jest + @testing-library/react for tests
- stylelint for LESS linting (config: `.stylelintrc.json`)

## Gotchas

- `npm run build-css` copies `src/style/override/theme.config` into `node_modules/semantic-ui-less/` before compiling (mutates `node_modules`); output goes to `public/static/ui-render.built.css`.
- Jest has no path-alias mapping (`jest.config.js`) — only relative imports resolve in tests.
- `isFunction()` from core utils rejects cross-realm functions such as `jest.fn()` — use plain functions in tests.
