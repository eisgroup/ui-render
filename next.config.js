const withTM = require('next-transpile-modules')([
  // pass the modules you would like to see transpiled
  'dux-utils'
])

module.exports = withTM()
