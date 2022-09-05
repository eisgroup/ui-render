/*
 * customize-cra simply makes react-app-rewired config easier with helper functions
 * (but it seems to ignore jest config set in package.json or jest.config.js, tested with "react-app-rewired": "^1.6.2")
 */
const { addBabelPlugins, addDecoratorsLegacy, override, useEslintRc, babelInclude, addWebpackAlias,
  removeModuleScopePlugin
} = require('customize-cra')
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
    removeModuleScopePlugin(),
    babelInclude([
      path.resolve('src'), // make sure you link your own source
      path.resolve('../core/src'),
      path.resolve('../ui-modules-pack/src'),
      path.resolve('../ui-utils-pack/src'),
      path.resolve('../ui-react-pack/src'),
    ]),
    addWebpackAlias({
      'ui-modules-pack': path.resolve(__dirname, '../ui-modules-pack/src'),
      'ui-react-pack': path.resolve(__dirname, '../ui-react-pack/src'),
      'ui-utils-pack': path.resolve(__dirname, '../ui-utils-pack/src')
    }),
    useEslintRc(),  // to enable decorators before `export` keyword for intuitive developer experience
    addDecoratorsLegacy(),  // requires `@babel/plugin-proposal-decorators`
    ...addBabelPlugins(
      // todo: check if `lodash` plugin increases hot-reload time on large projects
      'lodash',  // cherry pick imports to reduce final js bundle size, and increases build speed
      'transform-export-extensions',
      // 'import-graphql', // for importing .graphql and .gql files
      // 'semantic-ui-react' imports are already pruned correctly by CRA 2
    )
  )
}
