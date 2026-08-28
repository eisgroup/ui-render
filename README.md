
Check the [docs](https://eisgroup.github.io/ui-render/configuration) folder to get a basic understanding of the project's [architecture](https://eisgroup.github.io/ui-render) 

## Demo

https://eisgroup.github.io/ui-render/

## Supported `view` names

[`docs/SUPPORTED-VIEWS.md`](docs/SUPPORTED-VIEWS.md) lists every name a `meta.json` may use — the
`view` of a node, the value of a `render*` attribute, and the action names accepted by `onClick`,
`onChange` and `onDone` — including the views that are declared as constants but that no resolver
case handles. The page is generated from the `FIELD` constants plus the resolver source, so run
`npm run docs:views` after adding or removing either; a contract test fails while the page and the
source disagree.

## Installation (consumer)

`eis-ui-render` declares the following **peer dependencies**. The host application must install
them explicitly — they are not bundled. React must remain a single shared instance, while Moment
must be supplied by the host because the library build externalizes it.

| Package | Required version | Why it must be a peer |
|---|---|---|
| `react` | `^16.14.0 \|\| ^17.0.0 \|\| ^18.0.0` | A second copy of React in the tree triggers `Invalid hook call` and breaks Context (forms, providers). pnpm with strict node_modules will not deduplicate copies across non-overlapping ranges. |
| `react-dom` | `^16.14.0 \|\| ^17.0.0 \|\| ^18.0.0` | Must use the same major version as `react` so the renderer pair matches. |
| `moment` | `^2.29.4` | The library externalizes Moment and uses it for date pickers and formatters, so the host must provide a compatible 2.x version. |

Install (npm):

```bash
npm install eis-ui-render react@^18.0.0 react-dom@^18.0.0 moment@^2.29.4
```

Install (pnpm) — note that with `auto-install-peers=false` (the strict default in some setups)
peer dependencies are **not installed automatically**, so they must be listed explicitly:

```bash
pnpm add eis-ui-render react@^18.0.0 react-dom@^18.0.0 moment@^2.29.4
```

React 16.14 and 17 hosts remain supported and may keep matching `react@^16.14.0` or `react@^17.0.0`
dependencies while migrating on their own schedule. The library is developed and tested against
React 18.3.

If the host project relies on transitive copies of `react`/`react-dom`/`moment` from another
package instead of declaring them directly, pnpm in isolated mode will not resolve our peer
through them — the application must declare these three packages itself.

Other libraries previously listed as peer dependencies (`final-form`, `final-form-arrays`,
`react-final-form`, `react-final-form-arrays`, `prop-types`) are now bundled as regular
dependencies of `eis-ui-render`, so the host project does not need to install them.

`eis-ui-render` is consumed by a bundler — imported as a React component into a host application. Dropping
`dist/index.js` into a page with a `<script>` tag is **not supported**: the UMD global lookup never matched
React's real global name, so it has never worked.

## Styles and assets (consumer)

The library entry deliberately does not inject CSS, so the host loads the stylesheet itself. Both
paths below work and resolve to the same rules — `dist/static/*.css` are one-line `@import`
re-exports, so the bytes ship only once:

```js
import 'eis-ui-render/static/all.css'   // or 'eis-ui-render/dist/static/all.css'
import 'eis-ui-render/static/font.css'  // icon font — only if the host does not provide its own
```

Some renderers reference images by absolute URL (`<homepage>/static/images/…` — flag icons for the
language renderer, for example), so those files must also be reachable from the host's web root.
Copy the package's `static/` folder there as part of the build; it is self-contained:

```bash
cp -R node_modules/eis-ui-render/static ./public/
```

## The meta.json contract (consumer)

The package ships the UI declaration contract as a JSON Schema (draft 2020-12) at
`eis-ui-render/meta.schema.json`, so `meta.json` authors get autocomplete and validation in
their editor instead of discovering a typo at render time.

The quickest way in is a pointer inside the file itself — no workspace configuration, and it
works in VS Code and the JetBrains IDEs alike:

```json
{
  "$schema": "./node_modules/eis-ui-render/meta.schema.json",
  "view": "Col",
  "items": [{ "view": "Text", "name": "customer.name" }]
}
```

Or map it once for every meta file, in `.vscode/settings.json`:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["**/*_meta.json", "**/meta.json"],
      "url": "./node_modules/eis-ui-render/meta.schema.json"
    }
  ]
}
```

The schema is **permissive on purpose**. Component attributes are forwarded to the underlying
React component, so nodes accept properties the schema does not list, and `view`, render-method,
action and normalizer names suggest the built-in vocabulary without rejecting an unlisted string —
the renderer accepts those too. What the schema does constrain is the handful of shapes the engine
genuinely requires (`items`/`headers`/`extraItems`/`extraHeaders` must be arrays, `name` must be a
string), each of which is otherwise a render-time crash.

`$schema` is stripped before rendering, so adding it changes no output.

### Dev-mode validation

The same rules run at runtime behind an opt-in prop. It is off by default and walks nothing until
asked, so it costs a default host nothing:

```jsx
<UIRender data={data} meta={meta} validateMeta={process.env.NODE_ENV !== 'production'} />
```

Each problem is reported to `console.warn` on one line, naming the JSON path of the offending
node rather than leaving a stack trace inside a minified bundle:

```text
[ui-render] meta error at "items[3].items[0].name": name must be a string key path, got number …
[ui-render] meta warning at "headers[2].renderCell": unknown render method "double5" …
```

`error` means the engine will fail on that node; `warning` means it will render, but silently
degraded — an unknown `view` becomes a "field does not exist" placeholder, an unknown
`render*` method falls back to plain text. Pass a function instead of `true` to collect the
problems yourself (`validateMeta={problems => …}`); the reporter never throws into the host
application, whatever it finds.

### Contract version

`meta.json` may declare an optional root-level `metaVersion` (`"MAJOR"` or `"MAJOR.MINOR"`) to
record which contract it was authored against. The current contract version is **`1`**.

- **Absence means "current"** — the file targets whatever contract the installed
  `eis-ui-render` implements. That is the right choice when meta and library ship together, and
  it is why every existing `meta.json` keeps working untouched.
- **MAJOR** changes only for a change that would break existing meta; **MINOR** for additive
  ones. Declaring a version equal to or below what the library implements is always compatible.
- The engine **ignores the value** and strips the field before rendering: declaring it never
  changes output. Dev-mode validation is the only thing that reads it, and only to report a
  malformed value, a version newer than the installed library implements, or a `metaVersion`
  placed on a nested node, where it means nothing.

There is no negotiation beyond that, deliberately: the field exists so a future contract change
can be additive and announced, not so hosts can request a different renderer.

Note the unrelated legacy `version` attribute seen in older meta files: it is not a contract
version (existing files use it both as a producer version at the root and as a node label deeper
in the tree), the engine discards it, and new files should use `metaVersion`.

## Renderer configuration (consumer)

Three props configure how values are formatted and how the shell is labelled. They are
published to every component the renderer draws, so a nested `Table` cell honours them
exactly like a top-level field:

```jsx
<UIRender data={data} meta={meta} dateFormat="DD/MM/YYYY" currency="EUR" language="fr" />
```

| Prop | Default | Effect |
|---|---|---|
| `dateFormat` | `MM-DD-YYYY` | [`moment` format tokens](https://momentjs.com/docs/#/displaying/format/) for every date the renderer **displays** (an ISO value in a `Text` node, a `render*: "Date"` value) and **edits** (the date picker's display and parsing) |
| `currency` | `USD` | published as a CSS class on the renderer's shell (`.app.EUR`), for currency-specific styling |
| `language` | `en` | published as a CSS class on the renderer's shell (`.app.lang--fr`) |

Each is merged, not replaced: passing only `dateFormat` leaves `currency` and `language` at
their inherited values. `currency` is **not** `meta.currencyCode` — that one selects the
currency symbol the value renderers print, and is declared in meta rather than passed as a
prop.

> These props used to be accepted and then silently ignored — every date rendered as
> `MM-DD-YYYY` whatever was passed. If your application has been passing `dateFormat` and
> compensating for it elsewhere, it now takes effect.

## Error reporting (consumer)

The renderer catches a failure per node rather than letting one bad declaration blank the
page: the failing node is replaced by a one-line diagnostic and everything around it keeps
rendering. Pass `onError` to receive the same diagnostic as a structured report:

```jsx
<UIRender data={data} meta={meta} onError={report => Sentry.captureException(report.error, {
    extra: { metaPath: report.path, componentStack: report.errorInfo.componentStack },
})} />
```

```js
{
  error,      // the thrown value
  errorInfo,  // React's {componentStack}
  path,       // JSON path of the node in `meta`, e.g. 'items[3].items[0]' ('' = the root)
  props,      // that node's resolved props: its meta declaration plus what the engine added
  message,    // the one-line diagnostic, also rendered in place of the failed node
}
```

`path` is the point of the report — a stack trace out of a minified bundle names React
internals, while `items[3].items[0]` names the declaration to go and fix. It is exact for a
failure inside the component a node resolved to; for a failure the renderer hits while
preparing a node (a malformed `items`, say) it names the closest enclosing node, which is
the most precise position available.

The library logs the report itself as well, so `onError` adds a channel rather than
silencing the console. It never has to be defensive: a reporter that throws is caught, and
the render failure is still reported.

## Development Installation

The published package declares `engines.node >= 18`: that is the floor for *consuming* it, and the shipped
bundle needs nothing newer (its most modern syntax is optional chaining, and the packed artifact is
verified to server-render on Node 22 and 24). Building this repository is a different matter and uses the
version in `.nvmrc`, which is what CI installs.

1. Install [Node.js](https://nodejs.org/), if you haven't already — use the version in `.nvmrc` (v24).
2. Navigate to project root folder and install dependencies by running this command in terminal:

### `npm install`

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.<br>
Open [http://localhost:3001](http://localhost:3001) to view it in Chrome browser, then activate LiveReload extension.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### Live build mode

- Install `yalc` globally ```npm install -g yalc```
- In your application add a link to the library with `yalc add eis-ui-render --link` and reinstall dependencies
- Run `npm run yalc-watch` to build library and life reload 

### How to publish the library

- Bump the package version with `npm version patch` (or `minor`, `major`, or an explicit version).
  This also synchronizes every tracked `data-version` attribute.
- Inspect the package contents with `npm pack --dry-run`.
  The `prepack` lifecycle verifies version synchronization and builds the library automatically.
- Verify the artifact with `npm run test:pack`. It enforces the packaging budgets and then packs,
  extracts and server-renders the tarball in a throwaway consumer that has only the three peer
  dependencies available. CI runs both gates on every pull request.
- Login to npm with `npm login` if needed.
- Publish the verified version with `npm publish`. The same `prepack` checks and build run again
  immediately before npm creates the published package.

Do not edit the version in `package.json` manually: use `npm version` so source metadata, the
release commit, and the Git tag stay in sync.

### How to publish on GitHub Pages

- Run `npm run build` to prepare artifacts
- Run `npm run deploy` to upload artifacts to GitHub
