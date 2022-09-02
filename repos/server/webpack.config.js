/*
 * @Note:
 * this webpack.config.js is only used for bundling production build.
 * Nodemon compiles the code on the fly with babel-node and only uses .babelrc.
 * Package.json installs webpack on the fly before the build and then removes it to avoid
 * conflict with frontend version. For development run using Nodemon this is not necessary.
 * .babelrc and this config file are.only used for Backend because Frontend uses create-react-app config
 * @devDependencies:
 *    nodemon@1.18.7
 *    babel-cli@6.26.0 - for nodemon
 *    babel-core@6.26.0 - required for babelpolyfill generator functions
 *    babel-preset-env@1.6.1
 *    babel-preset-react@6.24.1
 *    babel-preset-stage-0@6.24.1
 *    babel-plugin-transform-decorators-legacy@1.3.5
 *    babel-plugin-transform-export-extensions@6.22.0
 *
 *    // These conflicted packages are installed temporarily for bundling build only
 *    babel-loader@7.1.4 - also used by CRA, and there is conflict
 *    webpack@4.4.1 - implicitly installed by CRA version 4.19.1
 *    webpack-cli@2.0.13
 *    webpack-node-externals@1.7.2
 *
 * Minification: - does not work, including with UglifyJsPlugin
 */
console.log('webpack.config loaded!!!!!!!!!')
module.exports = {
  mode: 'production',
  target: 'node',  // ignore built-in modules like path, fs, etc.
  // @Note: come libraries have nested dependencies that webpack does not bundle
  // and throws errors inside Docker container when they are not installed in deployment server.
  externals: [
    // ignore all modules in node_modules folder
    require('webpack-node-externals')(),
    {'sharp': 'commonjs sharp'}, // must be install in deployment because of binary build
  ],
  // entry: ['babel-polyfill'], // needed to run with pm2 in nodejs
  module: {
    rules: [
      {
        test: /\.js$/,
        // do not match js files inside node-modules in this directory
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            rootMode: 'upward',
            // do not use babel-loader on files inside upward node-modules
            ignore: [/node_modules\/(?!ui-utils-pack|ui-react-pack|ui-modules-pack)/],
          }
        }
      }
    ]
  },
  // Ignore IDE warning that property 'optimization' is not allowed
  // optimization: {
  //   minimize: true, // same as --optimize-minimize flag, needed to enable UglifyJsPlugin
  //   sideEffects: false,
  // }
}
