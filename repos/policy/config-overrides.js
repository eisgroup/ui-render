/*
 * customize-cra simply makes react-app-rewired config easier with helper functions
 * (but it seems to ignore jest config set in package.json or jest.config.js, tested with "react-app-rewired": "^1.6.2")
 */
const { addBabelPlugins, addDecoratorsLegacy, override, useEslintRc, babelInclude } = require('customize-cra')
const path = require('path')

/* Override default CRA config */
if (process.env.NODE_ENV === 'test') {
  console.log(`⚡ config-override.js loaded in ${process.env.NODE_ENV} mode!`)
  // Load different config to enable decorator in JEST test
  module.exports = override(
    useEslintRc(),  // to enable decorators before `export` keyword for intuitive developer experience
    ...addBabelPlugins( // must have @babel/core@7.1.0
      [
        '@babel/plugin-proposal-decorators',
        {
          'legacy': true
        }
      ],
      'transform-export-extensions'
    )
  )
} else {
  console.log('⚡ config-override.js loaded!')
  module.exports = override(
    babelInclude([
      path.resolve('src'), // make sure you link your own source
      path.resolve('../core/src'),
      path.resolve('../../node_modules/modules-pack'),
      path.resolve('../../node_modules/react-ui-pack'),
      path.resolve('../../node_modules/utils-pack'),
    ]),
    useEslintRc(),  // to enable decorators before `export` keyword for intuitive developer experience
    addDecoratorsLegacy(),  // requires `@babel/plugin-proposal-decorators`
    ...addBabelPlugins(
      // todo: check if `lodash` plugin increases hot-reload time on large projects
      'lodash',  // cherry pick imports to reduce final js bundle size, and increases build speed
      'transform-export-extensions',
      // 'import-graphql', // for importing .graphql and .gql files
      // 'semantic-ui-react' imports are already pruned correctly by CRA 2
    ),
    jsonpRename,
  )
}

/* Avoid conflict with Genesis UI Webpack config */
function jsonpRename (config) {
  config.output = {
    ...config.output,
    jsonpFunction: 'jsonpUiRender'
  }
  return config
}
