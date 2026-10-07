# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`eis-ui-render` is a React component library that generates UI from JSON schemas (meta + data). It takes a `meta.json` (UI structure/layout definition) and a `data.json` (values), and recursively renders a component tree. Published to npm as a UMD library, with a demo app hosted on GitHub Pages.

The modernization roadmap (React 17/18 upgrade, `semantic-ui-react` exit, project structure) lives in `docs/UPGRADE-PLAN.md`.

## Commands

- `npm start` — Run demo app in dev mode (webpack-dev-server)
- `npm run build` — Build the demo app for GitHub Pages deployment
- `npm run build-lib` — Build the publishable library to `dist/` (webpack + `gen-ts`)
- `npm run gen-ts` — Write the package's declarations from the source (§9.6-E4): `scripts/gen-ts.js` publishes
  `src/library/main.tsx`'s declaration as `dist/index.d.ts` (`export =`, with every type of `src/library/contract.ts`
  in a `UIRender` namespace) and the contract's as `dist/contract.d.ts`. There is no hand-written declaration: a
  public type is an export of `contract.ts`, and the generator refuses an import other than `react`, or a value.
- `npm run watch-lib` — Watch mode for the library build. Uses the SAME webpack config as `build-lib`, deliberately: it had its own parallel config until 2026-09-15, and it had drifted into emitting the stylesheet under a different name and producing no type declarations
- `npm run yalc-publish` — Build lib and publish locally via yalc (for testing in consuming apps)
- `npm run yalc-watch` — Auto-rebuild and yalc-publish on src changes
- `npm run deploy` — Deploy demo to GitHub Pages (run `build` first)
- `npm test` — Run Jest tests (on the installed React 18)
- `npm run test:react16` / `test:react17` / `test:react19` — The same suite on React 16.14, 17.0.2 and 19.3.0, each from an install-only fixture package (`scripts/fixtures/react16-floor`, `react17-floor`, `react19`). Never run these configs with bare `jest`; the harness asserts the React it loaded.
- `npm run test:watch` — Run Jest in watch mode
- `npm run test:coverage` — Jest with `--coverage --runInBand`; the global and per-file thresholds in `jest.config.js` gate it, and it is what CI's `verify` job runs
- `npm run test:e2e` — The browser leg (Playwright, `playwright.config.js`): builds the demo for production into `build-e2e/`, serves it on port 3199 and runs `e2e/*.pw.js` in Chromium, desktop and touch. `npm run test:e2e:install` installs Chromium first. `e2e/view-coverage.js` names, for every `view`, the browser tests that drive it or why none needs to, and `scripts/__tests__/view-browser-coverage.contract.test.js` keeps it complete
- `npm run test:types` — `build-lib`, then compiles consumer fixtures against `dist/*.d.ts` under `@types/react` 16, 17, 18 and 19, as an interop default import and as a CommonJS `import = require` (`scripts/test-public-types.js`)
- `npm run test:pack` — `build-lib`, then the packaging budgets (`test:pack:budget`, `scripts/check-package-budget.js`) and a server-render smoke of the packed tarball (`test:pack:consumer`). `npm run test:pack:peers` repeats the smoke on React 16.14, 17.0.2 and 19.3.0, from the same fixtures as the jest legs
- `npm run build-css` — Standalone CSS build (LESS → PostCSS prefixwrap → CSS)
- `npm run test:env-flags` — Compiles the source with each real webpack config (library, demo dev/prod, the e2e shape) and checks the env flags and `FILE.PATH_IMAGES` each ships, in a realm with no `process`. jest cannot see these: it runs the source against Node's real `process.env`. `_envs.ts` reads `process.env.NODE_ENV`/`REACT_APP_HOMEPAGE` as literals on purpose — never reintroduce `ENV.NODE_ENV` or a `typeof process` guard in front of them
- `npm run test:css:built` — `css.pipeline.parity.test.js` again, on the built `static/all.css` (run `build-lib`
  first), under `jest.built-css.config.js`, where a missing file fails instead of skipping. CI runs it after
  `build-lib`: its coverage run comes before the build, so the suite's checks of the published stylesheet skip there
- `npm run lint:css` — Lint LESS files with stylelint
- `npm run lint:js` — ESLint over `src`, with `--max-warnings 0` (see Tech Stack)
- `npm run typecheck` — `tsc --noEmit` over `src` (§9.6-E0). Babel STRIPS TypeScript types without
  checking them, so this is the only thing that checks them. JavaScript is not part of the program
  (`allowJs: false`): the demo and the tests stay JavaScript and are not checked, and a `.ts` file that
  imports a `.js` module fails (TS7016). Every `.ts` file is strict. Config: `tsconfig.json`. `tsconfig.build.json` EXTENDS
  it, for `gen-ts`'s declaration emit, so keep every checking rule in `tsconfig.json`.
- `npm run typecheck:contract` — The same check on `src/library/contract.agreement.ts` alone (`tsconfig.contract.json`), so a
  failure names the meta contract table
- `npm run docs:views` / `npm run docs:props` — Regenerate `docs/SUPPORTED-VIEWS.md` / `docs/SUPPORTED-PROPS.md` from the
  source and the prose in `scripts/view-reference-curation.js` / `scripts/wrapper-prop-curation.js`. Never edit the pages
  by hand: the `:check` variants, which CI and `prepack` run, fail on a page that differs from the generator's output
- `npm run css:fixture` — Regenerate `src/style/__tests__/semantic-contributed-css.txt`, the pinned CSS of the two vendored
  Semantic modules; `css:fixture:check` runs in CI
- `npm run sync-version` — Writes `package.json`'s version into the `data-version` of `src/library/AppWrapper.tsx` and
  `public/index.html` (`-- --check` reports drift); `npm version` runs it

## Architecture

### Dual build targets

1. **Library** (`src/library/`) — Entry point `src/library/index.ts`, built via `webpack.library.config.mjs` to `dist/`. Exports the `UIRender` component as UMD. `react`, `react-dom`, and `moment` are externalized (peer dependencies — the host app provides them), and so is `react/jsx-runtime`: JSX compiles to it (`babel.config.js` uses the automatic runtime), and a bundled copy would create elements through a different React than the host's. CSS is compiled from LESS and the real stylesheets and fonts ship **once** in the root `static/` folder — that is the payload hosts copy to their web root. No images ship: `static/images/flags/` stopped on 2026-10-01 (`docs/UPGRADE-PLAN.md` §10), and `npm run test:pack:budget` fails a tarball that carries it again. A name-only `Image` loads the HOST's `/static/images/<name>` (`FILE.PATH_IMAGES`; the library build bakes `process.env` to `{NODE_ENV: 'production'}` on purpose, so no homepage reaches it — `src/core/common/variables/index.ts` applies the homepage prefix only when one is set). `dist/static/all.css` and `font.css` are one-line `@import` re-exports of it, so bundler imports of the dist path keep working; `semantic.css` is a 0-byte stub in both places. The build also writes what the bundle carries from other packages: each one's licence file in `dist/THIRD-PARTY-LICENSES.txt` and a CycloneDX SBOM in `dist/sbom.cdx.json`, read from the chunks webpack emits rather than the module graph (`scripts/third-party-inventory.js`). A bundled package without a licence file fails the build. Packaging is gated by `npm run test:pack` (budgets + a packed-tarball server-render smoke) — never re-add an asset copy under `dist/static/`: the duplicate guard in `test:pack:budget` fails it.
2. **Demo app** (`src/demo/`) — Entry chain `src/demo/index.js` → `src/demo/main.jsx` (`createRoot`) → `src/demo/App.jsx`, built via `webpack.demo.config.mjs`. Used for development and GitHub Pages demo. The three entry files moved out of the `src/` root at §9.9-H3 so the top level reads `core/ | demo/ | library/ | style/` (plus jest's `__mocks__/`) and the library/demo boundary is visible from the directory listing alone. Note it says `createRoot`, not `ReactDOM.render` — the demo mounts through the React 18 root API. It renders under `<StrictMode>` since §9.3 step 7; `src/demo/examples/__tests__/examples.strict-mode.test.js` pins that every example renders and behaves the same with it and without it.

### Core rendering engine (`src/core/engine/`)

- `Render.tsx` — The recursive renderer. Takes props from meta definitions and renders components via `Render.Component` (component resolver) and `Render.Method` (render function resolver). These are set up in `mapper.tsx`.
- `transforms.ts` — `metaToProps()` recursively converts meta.json declarations into React props. `mapProps()` maps data arrays using mapper definitions.

### Component/method mapping (`src/core/engine/`)

- `mapper.tsx` — Configures `Render.Component` and `Render.Method`. Maps `view` strings (e.g., `"Row"`, `"Table"`, `"Dropdown"`) to actual React components, and `render*` strings to value formatting functions.
- `rules.tsx` — The main UIRender component with form handling (react-final-form), data processing, validation, actions (submit, download, upload, addData, removeData), and lifecycle management.
- `documentHost.ts` — Since §9.3 step 6 a document is not a React class component: its three classes (the declared `UIRender`, the engine layer, the form layer) are the classes of an INSTANCE, which the function component `hostDocument` builds hosts for its lifetime. They extend `DocumentInstance`, not `React.Component`. The host gives them `props`/`state`/`context`, `setState` with its callbacks, and the lifecycles, from layout effects. A props-driven sync goes in `deriveFromProps(nextProps)`, which is called during the render and may set nothing but the document's own state. Anything that reaches outside the document goes in `componentDidUpdate`. No `UNSAFE_*` lifecycle is left in `src`; do not add one. `Active.UIRender` is the host, and `Active.UIRender.InstanceClass` the class. The field decorators `asField` and `asInputDateField` (`modules/form`) work the same way since 2026-10-06: a memoised function component hosts one `FieldInstance` per mounted field, exposed as `InstanceClass` on what they return, and its render prop must stay one function for the field's lifetime.
- `formData.ts`, `errorMapping.ts`, `dataMapping.ts` — what the engine reads out of its forms (and the Select
  reordering), which validation errors it shows and the shape a host is handed, and how incoming data is
  normalized. They were one `utils.ts` until §9.9-H6.
- The actions and decisions lifted out of `rules.tsx` and `mapper.tsx` (§9.3 steps 2 and 6) are modules of their own:
  `download.ts`, `upload.ts`, `applyPeriods.ts` (with `apiError.ts`), `dataKindPush.ts` (the rows `addData`/`removeData`
  push and remove), `popupArgs.ts`, `popupScope.ts`, `popupTemplate.ts`, `showIf.ts`, `statePath.ts` and `autoSubmit.ts`.
  `validateMeta.ts` is the opt-in `validateMeta` prop, and `metaPath.ts` the JSON-path notation it shares with
  render-error reports.
- A new `FIELD.TYPE` view needs, besides its resolver case, an entry in `scripts/view-reference-curation.js` (then
  `npm run docs:views`), a classification in `e2e/view-coverage.js`, and a render by an example or by a declaration in
  `src/demo/examples/__tests__/examples.view-coverage.test.js`: the generator and the two tests fail until it has them.

### Internal layering and imports

All internal imports use **relative paths** — there are no `ui-*-pack` webpack aliases (the only resolve alias left is `process`; the three `theme.config` aliases went with `semantic-ui-less` at §9.7-F1 step 4). The historical "pack" names survive as directory layers:

| Layer (historical name) | Path |
|---|---|
| `ui-react-pack` — presentational | `src/core/components` |
| `ui-modules-pack` — form/upload/fields | `src/core/modules` |
| `ui-utils-pack` — pure utils | `src/core/utils` |
| _(no historical name)_ — shared mutable registries | `src/core/state` |

Dependency direction (keep it one-way): `utils` imports nothing above it; `state` may import `utils`; `components` may import `state`/`utils`; `modules` may import `components`/`state`/`utils`; the engine (`core/engine`, which was `pages/main` + `ui-render` until §9.9-H4 merged them) may import anything in core; core never imports the demo. `eslint.config.js` enforces the direction with a `no-restricted-imports` entry per layer. `src/core/state/` is the newest and smallest layer (§9.3 step 2): it holds ONLY the registries the engine and `modules/form` both write to (`formRegistry.ts`), which used to live one on each side of that boundary and made the two import each other. Nothing else belongs there. The errors, the touched fields and the initial-values baseline are per form (`errorsFor`, `touchedFor`, `baselineOf`, keyed by the final-form object); `formsStorage` holds every mounted form, and a document reads only its own tree's through `formsOf(tree)`, never the map itself. `semantic-ui-react` is not a dependency at all: the §9.7-F1 exit completed at step 3 and step 3½
removed the package, so **nothing in `src` may import it — including `src/core/components`**, which
used to be the one place that could. The `no-restricted-imports` guard (a `package.json` override then, an
`eslint.config.js` entry now) lost its `excludedFiles` exemption in that commit. `scripts/generate-wrapper-prop-reference.js`'s scan
also sees the `require`/`jest.mock`/dynamic `import` the rule cannot: one outside `src/core/components` fails the generator,
and one inside changes `docs/SUPPORTED-PROPS.md`, so `docs:props:check` fails.

### Key internal packages

- **`ui-react-pack`** (`src/core/components/`) — Presentational components (Button, Dropdown, Table, Row, View, Input, Select, etc.). In-house: the `semantic-ui-react` exit finished at §9.7-F1 step 3 part 2, and the components still emit Semantic's class vocabulary (`ui selection dropdown`, `ui table`) because the CSS selects on it: the dropdown module vendored into `src/style/vendor/` at step 4, and our own `src/style/components/table.less`.
- **`ui-utils-pack`** (`src/core/utils/`) — Pure utility functions (array, object, string, number, codec, storage helpers).
- **`ui-modules-pack`** (`src/core/modules/`) — Higher-level modules: form integration (react-final-form wrappers), upload handling, variable/field definitions (`FIELD.TYPE`, `FIELD.RENDER`, `FIELD.ACTION`).

### Meta/Data JSON contract

The UI is driven by two JSON inputs:
- **meta.json** — Declares the component tree: `view` (component type), `items` (children), `name` (data binding path), `render*` (value formatters), `showIf` (conditional rendering), validation rules, etc.
- **data.json** — Flat or nested data object. Values are resolved via dot-path from `name` fields in meta.

`meta.schema.json` (repository root, shipped in the package) is the meta contract as a JSON Schema, for editors; the opt-in
`validateMeta` prop checks the same shapes at runtime, without a schema engine, and reports the JSON path of a node that breaks
one; `src/library/contract.ts` types the contract for hosts.

Examples live in `src/demo/examples/` (e.g., `example_meta.json` / `example_data.json`). `src/demo/examples/manifest.js` is
the one list of them the demo page and the tests read: the directory also holds untracked working files, so nothing may
enumerate it.

### Context and providers

- `ConfigContext` (`src/core/contexts/`) — Provides `dateFormat`, `currency`, `language` globally.
- `AppContext` (`src/core/contexts/`) — The popup state (`setPopupState`), and the `popupRoot` node `AppWrapper` publishes for
  a document's popups to portal into.
- `AppProvider` (`src/core/providers/`) — Wraps the library export with context providers.
- `ConfigOverride` (`src/core/providers/`) — Publishes a host's `dateFormat`/`currency`/`language` props into `ConfigContext`,
  each given key merged over the inherited value; `src/library/main.tsx` and the engine's render both use it.

## Tech Stack

- React `^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0` (peer dependency); development and the default suite run on 18.3, and each of the other three has its own gating CI leg. **No Semantic UI at all**: the components went in-house at §9.7-F1 steps 1-3 and the CSS at step 4, where the two modules still in use were compiled into `src/style/vendor/` and the package removed. Components still emit Semantic's class tokens (`ui selection dropdown`, `ui table`) because the vendored dropdown CSS and our own `table.less` select on them.
- react-final-form for form state management
- moment for dates (peer dependency, externalized); charts are custom SVG (`src/core/components/charts/` — no recharts)
- `src/core` and `src/library` are TypeScript throughout, tests aside (§9.6-E3, 2026-10-01); the
  demo and the test suites are JavaScript. Meta nodes are typed as open JSON (`any` where the engine
  reads and rewrites them by key): `validateMeta` checks them at runtime, and the published types in
  `src/library/contract.ts` describe them. `@babel/preset-typescript` compiles `.ts`/`.tsx` in all three
  pipelines (library build, demo build, Jest) and `npm run typecheck` checks them. The migration is
  complete (`docs/UPGRADE-PLAN.md` §9.6): `allowJs` is off, the declarations are generated from the
  source (E4) and the propTypes are gone (E5). The E0 guard, `src/toolchain/`, was deleted with it: the
  product's own TypeScript, which every pipeline builds and every suite imports, now proves the same.
- No `propTypes` and no `prop-types` (§9.6-E5): a component's props are its exported TypeScript props
  type, and a prop's description is that type's JSDoc. Do not add a `propTypes` block. `prop-types` is
  still installed, as a dependency of development packages, so an import would resolve and bundle it
  again: `no-restricted-imports` rejects it everywhere in `src`, as it does `semantic-ui-react`.
- LESS for styling, compiled via webpack (entry: `src/style/index.less`). Semantic UI theme overrides at `src/style/override/`. PostCSS prefixwrap scopes all CSS under `.ui-render`, except the `.ui-render-*` rules, which stay global because `rc-picker` portals its dropdown outside the wrapper (`scripts/prefixwrap-options.js`). LESS is on **4.x** — the 3.x pin was removed at §9.8 with byte-identical output. Every compile takes its options from `scripts/less-options.js`; do not set them locally. Three things there are load-bearing and each has its reason in the file: `math: 'always'` (LESS 4 changed division), `javascriptEnabled` (our own `` `Math.random()` `` font cache-buster at `_variables.less:23`, not Semantic's), and requiring the NODE build explicitly, because LESS 4's `browser` field plus jest's jsdom environment otherwise loads a build that fetches imports over XHR. `less-plugin-functions` makes `size()`/`px()` callable at 133 sites and needs `scripts/less-plugin-compat.js` to run on LESS 4.
- Node.js v24 (see `.nvmrc`), with npm 11.9.0 pinned in `packageManager`. npm ignores that field (measured); only corepack, enabled for npm, enforces it
- ESLint 9, flat config in `eslint.config.js`: `eslint-config-react-app`'s rules carried over as they were (it never supported ESLint 9), with the plugins installed directly; the file says what changed and why. An `eslint-disable` comment that suppresses nothing is reported, so delete one when its reason goes. `lint:js` runs with `--max-warnings 0`, so a new warning fails CI — fix it, or suppress it with a comment stating why the rule is wrong. Never blanket-disable: one tolerated warning here turned out to be a real crash (see `docs/UPGRADE-PLAN.md` §11 R18).
- Babel 8. Its config lives only in `babel.config.js` and is shared by the library build, the demo build and jest; the file says why its two non-default options, preset-react's `development: false` and preset-typescript's `onlyRemoveTypeImports: false`, must stay. Do not add `presets` to a `babel-loader` `options` block: a loader-level entry **replaces** the shared one for the same plugin identifier, silently dropping the shared options. Only demo-specific dev transforms (`react-refresh/babel`) belong inline.
- Jest + @testing-library/react for tests; Playwright (`playwright.config.js`, `e2e/*.pw.js`) for the browser leg, a gating CI job
- stylelint for LESS linting (config: `.stylelintrc.json`)
- Dependabot (`.github/dependabot.yml`) proposes updates weekly: for the devDependencies, a week's minor and patch updates in
  one PR and each major in its own, except the form stack's and Babel's, which can only move together and arrive as one PR
  per family; the React and ESLint majors are ignored, with the reason beside each; for the GitHub Actions, one grouped PR

## Gotchas

- `npm run build-css` compiles `src/style/index.less` to `public/static/ui-render.built.css`. **It no longer mutates `node_modules`,** and neither does `npx jest`: both used to copy `theme.config` into `node_modules/semantic-ui-less/` because Semantic's definitions import it from inside their own package. §9.7-F1 step 4 removed the package, so the copy, the shared helper that made it and the three webpack `theme.config` aliases are all gone. The jest `setupFiles` entry survives as a documented no-op.
- Jest has no path-alias mapping (`jest.config.js`) — only relative imports resolve in tests.
- `isFunction()` from core utils rejects cross-realm functions such as `jest.fn()` — use plain functions in tests.
- A test that prints to `console.error` or `console.warn` fails, on every leg (`scripts/jest-console-guard.js`). A test that expects a line replaces that method with a mock (`jest.spyOn(console, 'warn').mockImplementation(...)`) and asserts it; a spy without a mock implementation still prints. React logs some warnings once per module, so such an assertion belongs in the file's first test to trigger it.
- Babel 8 is ES modules only, and jest's module registry cannot load it: its `require(esm)` needs Node run with `--experimental-vm-modules`. A suite that needs Babel itself runs it in a child Node process, as `_envs.bundled.test.js` does through `scripts/fixtures/bundler-define.mjs`; a direct call names its caller, since Babel 8 assumes an unnamed one runs ES modules and leaves `import`/`export` in place.
- Never capture an engine import in a module-level `const`: `rules.tsx` → `mapper.tsx` → `Data` → `rules.tsx` is an import cycle, and a top-level `const X = Imported as …` captures the still-undefined export for good (every nested form-backed document then renders nothing). Cast or read it where it is USED, inside the render, which sees the live binding. Capturing a `utils` import is safe: `utils` imports nothing above it.
