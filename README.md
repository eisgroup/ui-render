
Check the [docs](https://eisgroup.github.io/ui-render/configuration) folder to get a basic understanding of the project's [architecture](https://eisgroup.github.io/ui-render) 

## Demo

https://eisgroup.github.io/ui-render/

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
- Run `npm start yalc-watch` to build library and life reload 
- In your application add a link to the library with `yalc add eis-ui-render --link` and reinstall dependencies

### How to publish

- Run `npm run build-lib`
- Login to npm `npm login`
- Publish new version `npm publish`

