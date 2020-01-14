module.exports = (api) => {
  // if (process.env.NODE_ENV !== 'test') console.log('⚡ babel.config.js loaded!')

  api.cache(false) // set cache as true/false

  /*
  @IMPORTANT: must install all babel dependencies at once, because version mismatch may cause hard to debug errors.
  yarn add -D -W \
  @babel/core @babel/node \
  @babel/plugin-proposal-class-properties @babel/plugin-proposal-decorators babel-plugin-import-graphql \
  @babel/preset-env @babel/preset-react babel-plugin-lodash babel-plugin-transform-export-extensions \
  babel-loader webpack \
  babel-jest jest
  */
  /*
  If using babel-node cli through nodemon, must call it like this to transpile correctly:
  babel-node --root-mode upward --ignore node_modules
  */
  // Tested with Node 10.15.3
  // Currently .babelrc is only used for backend Node.js with babel 6, because frontend has its own config.
  // This babel.config.js is loaded by global JEST test automatically, but not with babel 6
  // because it only searches for .babelrc files upwards (with --ignore option).
  // This file can also be loaded by parsing `--config-file` option (only available with for @babel/node 7), like so:
  // $ babel-node --config-file ../../babel.config.js # inside nodemon.json
  return {
    plugins: [
      [
        '@babel/plugin-proposal-decorators',
        {
          'legacy': true
        }
      ],
      '@babel/plugin-proposal-class-properties',
      'transform-export-extensions',
      // 'import-graphql',
    ],
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
      '@babel/preset-react'
    ],
    ignore: [/node_modules/], // required to transform packages outside of current working directory for each package
    babelrcRoots: [
      // Keep the root as a root
      '.',

      // Also consider monorepo packages "root" and load their .babelrc files.
      './repos/*'
    ]
  }
}
