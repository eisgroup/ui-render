# UI Render npm package

This repository contains production bundles of UI Render that can be integrated to any website using React.js.

## Installation

Install the package from public npm to your project:

```shell
yarn add eis-ui-render
```

## Build & Deploy Steps

1. Clone this package `git clone https://github.com/eisgroup/ui-render.git`
2. Inside `/repos/npm/` run `yarn build`
3. Then navigate to `/repos/policy/` folder and follow `README.md` instructions
4. Copy generated `/repos/policy/dist/static` folder to `/repos/npm/dist/static`
5. Add `/repos/npm/dist/.npmrc` with the content `//registry.npmjs.org/:_authToken=<npm_your_private_tocken>`
6. From single terminal instance login to npm `npm login` and publish to npm: `npm run push`
