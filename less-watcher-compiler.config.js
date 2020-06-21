module.exports = function () {
  return {
    // Default Options
    files: [ // list of source files to watch for changes and corresponding tasks to run
      {
        task: 'css', // name of the task to run, must be one of ['css', 'copy']
        watch: [ // file/s to watch for changes, using glob pattern
          'style/**/*.less',
          'style/override/**/*',
          'style/theme.config'
        ],
        compile: 'style/all.less', // file/s to compile when changes detected, using glob pattern
        output: 'public/static/', // destination directory where new file/s should be saved
      },
      {
        task: 'copy', // copy over `compile` file/s to `output` directory without compilation
        watch: [
          'style/fonts/**/*', // watch for changes of all file types within `style/fonts/` directory
        ],
        compile: 'style/fonts/**/*.{eot,eof,svg,ttf,woff,woff2}', // only copy over files with matched extensions
        output: 'public/static/fonts/',
        renameOptions: {dirname: ''}, // make folder structure flat on output, using `gulp-rename` npm package
      },
    ],
    symlinks: [ // useful for Semantic UI theme.config setup using `semantic-ui-less` library
      {
        // paths are relative to process.cwd()
        target: 'style/theme.config', // path to the source file to reference
        link: 'node_modules/semantic-ui-less/theme.config' // path to the file that references the target
      }
    ],
    minify: false,
    sourcemap: false,
    autoprefix: true,
    flexbugsfix: true,
    javascriptEnabled: true,
    browserslist: {
      'production': [
        '>0.3%',
        'not dead',
        'not op_mini all'
      ],
      'development': [
        'last 1 chrome version',
        'last 1 firefox version',
        'last 1 safari version',
        'last 1 ie version'
      ]
    },
    plugins: [
      'less-plugin-glob',
      'less-plugin-functions',
    ],
  }
}
