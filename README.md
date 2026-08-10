
Check the [docs](https://eisgroup.github.io/ui-render/configuration) folder to get a basic understanding of the project's [architecture](https://eisgroup.github.io/ui-render) 

## Demo

https://eisgroup.github.io/ui-render/

## Installation (consumer)

`eis-ui-render` declares the following **peer dependencies**. The host application must install
them explicitly — they are not bundled. React must remain a single shared instance, while Moment
must be supplied by the host because the library build externalizes it.

| Package | Required version | Why it must be a peer |
|---|---|---|
| `react` | `^16.14.0 \|\| ^17.0.0` | A second copy of React in the tree triggers `Invalid hook call` and breaks Context (forms, providers). pnpm with strict node_modules will not deduplicate copies across non-overlapping ranges. |
| `react-dom` | `^16.14.0 \|\| ^17.0.0` | Must use the same major version as `react` so the renderer pair matches. |
| `moment` | `^2.29.4` | The library externalizes Moment and uses it for date pickers and formatters, so the host must provide a compatible 2.x version. |

Install (npm):

```bash
npm install eis-ui-render react@^17.0.0 react-dom@^17.0.0 moment@^2.29.4
```

Install (pnpm) — note that with `auto-install-peers=false` (the strict default in some setups)
peer dependencies are **not installed automatically**, so they must be listed explicitly:

```bash
pnpm add eis-ui-render react@^17.0.0 react-dom@^17.0.0 moment@^2.29.4
```

React 16.14 hosts remain supported and may keep matching `react@^16.14.0` and
`react-dom@^16.14.0` dependencies while migrating on their own schedule.

If the host project relies on transitive copies of `react`/`react-dom`/`moment` from another
package instead of declaring them directly, pnpm in isolated mode will not resolve our peer
through them — the application must declare these three packages itself.

Other libraries previously listed as peer dependencies (`final-form`, `final-form-arrays`,
`react-final-form`, `react-final-form-arrays`, `prop-types`) are now bundled as regular
dependencies of `eis-ui-render`, so the host project does not need to install them.

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

## Development Installation

1. Install [Node.js](https://nodejs.org/), if you haven't already (version v24).
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
