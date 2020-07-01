const withPlugins = require('next-compose-plugins')
module.exports = withPlugins([
  require('next-transpile-modules')([
    // pass the modules you would like to see transpiled
    'utils-pack'
  ]),
], {})
