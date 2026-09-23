# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`eis-ui-render` is a React component library that generates UI from JSON schemas (meta + data). It takes a `meta.json` (UI structure/layout definition) and a `data.json` (values), and recursively renders a component tree. Published to npm as a UMD library, with a demo app hosted on GitHub Pages.

The modernization roadmap (React 17/18 upgrade, `semantic-ui-react` exit, project structure) lives in `docs/UPGRADE-PLAN.md`.

## Commands

- `npm start` — Run demo app in dev mode (webpack-dev-server)
- `npm run build` — Build the demo app for GitHub Pages deployment
- `npm run build-lib` — Build the publishable library to `dist/` (webpack + tsc)
- `npm run watch-lib` — Watch mode for the library build. Uses the SAME webpack config as `build-lib`, deliberately: it had its own parallel config until 2026-09-15, and it had drifted into emitting the stylesheet under a different name and producing no type declarations
- `npm run yalc-publish` — Build lib and publish locally via yalc (for testing in consuming apps)
- `npm run yalc-watch` — Auto-rebuild and yalc-publish on src changes
- `npm run deploy` — Deploy demo to GitHub Pages (run `build` first)
- `npm test` — Run Jest tests
- `npm run test:watch` — Run Jest in watch mode
- `npm run build-css` — Standalone CSS build (LESS → PostCSS prefixwrap → CSS)
- `npm run lint:css` — Lint LESS files with stylelint
- `npm run typecheck` — `tsc --noEmit` over `src` (§9.6-E0). Babel STRIPS TypeScript types without
  checking them, so this is the only thing that checks them. Unconverted `.js` resolves but is not
  checked (`checkJs: false`); every `.ts` file is strict. Config: `tsconfig.json` — not
  `tsconfig.build.json`, which is the separate declaration-emit config used by `gen-ts`.

## Architecture

### Dual build targets

1. **Library** (`src/library/`) — Entry point `src/library/index.js`, built via `webpack.library.config.mjs` to `dist/`. Exports the `UIRender` component as UMD. `react`, `react-dom`, and `moment` are externalized (peer dependencies — the host app provides them). CSS is compiled from LESS and the real stylesheets, fonts and images ship **once** in the root `static/` folder — that is the payload hosts copy to their web root, because `FILE.PATH_IMAGES` resolves to `<homepage>/static/images/`. `dist/static/all.css` and `font.css` are one-line `@import` re-exports of it, so bundler imports of the dist path keep working; `semantic.css` is a 0-byte stub in both places. Packaging is gated by `npm run test:pack` (budgets + a packed-tarball server-render smoke) — never re-add an asset copy under `dist/static/`, the duplicate guard fails the build.
2. **Demo app** (`src/demo/`) — Entry chain `src/demo/index.js` → `src/demo/main.jsx` (`createRoot`) → `src/demo/App.jsx`, built via `webpack.demo.config.mjs`. Used for development and GitHub Pages demo. The three entry files moved out of the `src/` root at §9.9-H3 so the top level reads `core/ | demo/ | library/ | style/` and the library/demo boundary is visible from the directory listing alone. Note it says `createRoot`, not `ReactDOM.render` — the demo mounts through the React 18 root API.

### Core rendering engine (`src/core/ui-render/`)

- `Render.js` — The recursive renderer. Takes props from meta definitions and renders components via `Render.Component` (component resolver) and `Render.Method` (render function resolver). These are set up in `mapper.js`.
- `transforms.js` — `metaToProps()` recursively converts meta.json declarations into React props. `mapProps()` maps data arrays using mapper definitions.

### Component/method mapping (`src/core/pages/main/`)

- `mapper.js` — Configures `Render.Component` and `Render.Method`. Maps `view` strings (e.g., `"Row"`, `"Table"`, `"Dropdown"`) to actual React components, and `render*` strings to value formatting functions.
- `rules.js` — The main UIRender component with form handling (react-final-form), data processing, validation, actions (submit, download, upload, addData, removeData), and lifecycle management.
- `utils.js` — Data transformation helpers (error mapping, normalization, form data extraction).

### Internal layering and imports

All internal imports use **relative paths** — there are no `ui-*-pack` webpack aliases (the only resolve alias left is `process`; the three `theme.config` aliases went with `semantic-ui-less` at §9.7-F1 step 4). The historical "pack" names survive as directory layers:

| Layer (historical name) | Path |
|---|---|
| `ui-react-pack` — presentational | `src/core/components` |
| `ui-modules-pack` — form/upload/fields | `src/core/modules` |
| `ui-utils-pack` — pure utils | `src/core/utils` |

Dependency direction (keep it one-way): `utils` imports nothing above it; `components` may import `utils`; `modules` may import `components`/`utils`; the engine (`pages/main` + `ui-render`) may import anything in core. `semantic-ui-react` is not a dependency at all: the §9.7-F1 exit completed at step 3 and step 3½
removed the package, so **nothing in `src` may import it — including `src/core/components`**, which
used to be the one place that could. The `no-restricted-imports` override in `package.json` lost its
`excludedFiles` exemption in that commit, and `scripts/generate-wrapper-prop-reference.js`'s scan
enforces the same thing for `require`/`jest.mock`/dynamic `import`.

### Key internal packages

- **`ui-react-pack`** (`src/core/components/`) — Presentational components (Button, Dropdown, Table, Row, View, Input, Select, etc.). In-house: the `semantic-ui-react` exit finished at §9.7-F1 step 3 part 2, and the LESS still carries Semantic's class vocabulary (`ui selection dropdown`, `ui table`) because the CSS is re-homed separately at step 4.
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

- React 16 (peer dependency). **No Semantic UI at all**: the components went in-house at §9.7-F1 steps 1-3 and the CSS at step 4, where the two modules still in use were compiled into `src/style/vendor/` and the package removed. Components still emit Semantic's class tokens (`ui selection dropdown`, `ui table`) because the vendored CSS selects on them.
- react-final-form for form state management
- moment for dates (peer dependency, externalized); charts are custom SVG (`src/core/components/charts/` — no recharts)
- TypeScript is wired up but the source is still JavaScript: `@babel/preset-typescript` compiles
  `.ts`/`.tsx` in all three pipelines (library build, demo build, Jest) and `npm run typecheck`
  checks them. `src/toolchain/` holds a guard proving that stays true — delete it once real
  converted modules cover the same ground (`docs/UPGRADE-PLAN.md` §9.6).
- LESS for styling, compiled via webpack (entry: `src/style/index.less`). Semantic UI theme overrides at `src/style/override/`. PostCSS prefixwrap scopes all CSS under `.ui-render`. LESS is on **4.x** — the 3.x pin was removed at §9.8 with byte-identical output. Every compile takes its options from `scripts/less-options.js`; do not set them locally. Three things there are load-bearing and each has its reason in the file: `math: 'always'` (LESS 4 changed division), `javascriptEnabled` (our own `` `Math.random()` `` font cache-buster at `_variables.less:23`, not Semantic's), and requiring the NODE build explicitly, because LESS 4's `browser` field plus jest's jsdom environment otherwise loads a build that fetches imports over XHR. `less-plugin-functions` makes `size()`/`px()` callable at 186 sites and needs `scripts/less-plugin-compat.js` to run on LESS 4.
- Node.js v24 (see `.nvmrc`)
- ESLint with `react-app` config (configured in package.json). `lint:js` runs with `--max-warnings 0`, so a new warning fails CI — fix it, or suppress it with a comment stating why the rule is wrong. Never blanket-disable: one tolerated warning here turned out to be a real crash (see `docs/UPGRADE-PLAN.md` §11 R18).
- Babel config lives only in `babel.config.js` and is shared by the library build, the demo build and jest. Do not add `presets` to a `babel-loader` `options` block: a loader-level entry **replaces** the shared one for the same plugin identifier, silently dropping the shared options. Only demo-specific dev transforms (`react-refresh/babel`) belong inline.
- Jest + @testing-library/react for tests
- stylelint for LESS linting (config: `.stylelintrc.json`)

## Gotchas

- `npm run build-css` compiles `src/style/index.less` to `public/static/ui-render.built.css`. **It no longer mutates `node_modules`,** and neither does `npx jest`: both used to copy `theme.config` into `node_modules/semantic-ui-less/` because Semantic's definitions import it from inside their own package. §9.7-F1 step 4 removed the package, so the copy, the shared helper that made it and the three webpack `theme.config` aliases are all gone. The jest `setupFiles` entry survives as a documented no-op.
- Jest has no path-alias mapping (`jest.config.js`) — only relative imports resolve in tests.
- `isFunction()` from core utils rejects cross-realm functions such as `jest.fn()` — use plain functions in tests.
