module.exports = (api) => {
  api.cache(false) // set cache as true/false

  return {
    plugins: [
      [
        '@babel/plugin-proposal-decorators',
        {
          'legacy': true
        }
      ],
      '@babel/plugin-proposal-class-properties',
      'transform-export-extensions'
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
    babelrcRoots: [
      // Keep the root as a root
      '.',

      // Also consider monorepo packages "root" and load their .babelrc files.
      './repos/*'
    ]
  }
}
