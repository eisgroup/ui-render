
Check the [docs](https://eisgroup.github.io/ui-render/configuration) folder to get a basic understanding of the project's [architecture](https://eisgroup.github.io/ui-render) 

## Demo

https://eisgroup.github.io/ui-render/

## Installation (consumer)

`eis-ui-render` declares the following **peer dependencies**. The host application must install
them explicitly — they are not bundled. React must remain a single shared instance, while Moment
must be supplied by the host because the library build externalizes it.

| Package | Required version | Why it must be a peer |
|---|---|---|
| `react` | `^16.14.0 || ^17.0.0` | A second copy of React in the tree triggers `Invalid hook call` and breaks Context (forms, providers). pnpm with strict node_modules will not deduplicate copies across non-overlapping ranges. |
| `react-dom` | `^16.14.0 || ^17.0.0` | Must use the same major version as `react` so the renderer pair matches. |
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

- Run `npm run build-lib`
- Login to npm `npm login`
- Publish new version `npm publish`

### How to publish on GitHub Pages

- Run `npm run build` to prepare artifacts
- Run `npm run deploy` to upload artifacts to GitHub
