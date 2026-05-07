
Check the [docs](https://eisgroup.github.io/ui-render/configuration) folder to get a basic understanding of the project's [architecture](https://eisgroup.github.io/ui-render) 

## Demo

https://eisgroup.github.io/ui-render/

## Installation (consumer)

`eis-ui-render` declares the following **peer dependencies**. The host application must install
them explicitly — they are not bundled. Versions matter: keeping a single shared instance of
React and Moment in the application is required for the library to work correctly.

| Package | Required version | Why it must be a peer |
|---|---|---|
| `react` | `^16.14.0` | A second copy of React in the tree triggers `Invalid hook call` and breaks Context (forms, providers). pnpm with strict node_modules will not deduplicate copies across non-overlapping ranges. |
| `react-dom` | `^16.14.0` | Must come from the same install as `react` for the renderer pair to match. |
| `moment` | `~2.29.4` | The library renders dates and accepts `moment` instances on its API. If the application also uses Moment with a different copy, `value instanceof moment` checks fail (silent UI bugs in date pickers). |

Install (npm):

```bash
npm install eis-ui-render react@^16.14.0 react-dom@^16.14.0 moment@~2.29.4
```

Install (pnpm) — note that with `auto-install-peers=false` (the strict default in some setups)
peer dependencies are **not installed automatically**, so they must be listed explicitly:

```bash
pnpm add eis-ui-render react@^16.14.0 react-dom@^16.14.0 moment@~2.29.4
```

If the host project relies on transitive copies of `react`/`react-dom`/`moment` from another
package instead of declaring them directly, pnpm in isolated mode will not resolve our peer
through them — the application must declare these three packages itself.

Other libraries previously listed as peer dependencies (`final-form`, `final-form-arrays`,
`react-final-form`, `react-final-form-arrays`, `prop-types`) are now bundled as regular
dependencies of `eis-ui-render`, so the host project does not need to install them.

## Development Installation

1. Install [Node.js](https://nodejs.org/), if you haven't already (version v22).
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