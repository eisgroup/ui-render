module.exports = (api) => {
  // @Note: Next.js only loads its local repo '.babelrc' or 'babel.config.js'.
  // This 'babel.config.js' is loaded by global Jest test automatically.
  // Tested with Node 10.15.3
  // console.log('⚡ babel.config.js loaded!')

  api.cache(false) // set cache as true/false

  return {
    presets: [
      'next/babel'
    ],
    plugins: [
      [
        '@babel/plugin-proposal-decorators',
        {
          'legacy': true
        }
      ],
      // 'import-graphql',
    ],
  }
}
