# Javascript Helper Functions
This package contains commonly used js functions, to be used as functional utility helpers within your Javascript project.

## Requirement
- ES6 compatible project, or must set this package to be transpiled.
  
The reason is because IDE Webstorm does not resolve `export * from './file.js` when transpiled with babel to commonjs2.

## Usage
### 1. Initial Setup
```js
import { Active } from 'utils-pack'

Active.log = require('chalk') // use colored console.log for Node.js
Active.Storage = require('node-persist') // set localStorage for Node.js
```
