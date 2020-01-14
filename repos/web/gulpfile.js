// =============================================================================
// CONFIGS
// run with `--sourcemap` to generate source map files
// =============================================================================
const themeConfigPath = '../../node_modules/semantic-ui-less/theme.config'
const input = 'style/' // relative path to styles folder
const output = 'public/static/'
const pwd = __dirname + '/'
const browsers = [ // browser support list
  ">0.2%",
  "not dead",
  "not ie <= 11",
  "not op_mini all"
]
const files = {
  // Files to watch
  watch: {
    css: [input + '**/*.less', input + 'override/**/*', input + 'theme.config'],
    fonts: input + 'fonts/**/*',
  },
  // Files to compile
  css: input + '_all.less',
  fonts: input + 'fonts/**/*.{eot,eof,svg,ttf,woff,woff2}',
  // Distribution folders
  build: {
    css: output,
    fonts: output + 'fonts/',
  }
}
const isProduction = process.env.NODE_ENV === 'production'
console.debug('running gulp in ' + (process.env.NODE_ENV || 'development'))

// =============================================================================
// DEPENDENCIES
// =============================================================================
const gulp = require('gulp')
/* report what gulp is doing */
const gutil = require('gulp-util')
/* watches all changes including new files */
const watch = require('gulp-watch')
/* maps output to source files for debugging */
const sourcemaps = require('gulp-sourcemaps')
/* prevents errors from breaking gulp tasks */
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const liveReload = require('gulp-livereload')
/* compiles less files to css */
const less = require('gulp-less')
/* allows to import multiple less files using glob expressions (e.g. @import "common/**";) */
/* usage: .pipe(less({plugins: [lessglob]})) */
const lessGlob = require('less-plugin-glob')
const lessFunctions = new (require('less-plugin-functions'))()
const lessAutoprefix = new (require('less-plugin-autoprefix'))({browsers: browsers})
const lessMinify = new (require('less-plugin-clean-css'))({advanced: true})
const hasSourcemap = !!gutil.env.sourcemap
const shouldMinify = !!gutil.env.minify
/* minify css with cssnano because csso (fastest) does not work with postcss */
/* see benchmark: http://goalsmashers.github.io/css-minification-benchmark/ */
/* and since we only need css minification in production, speed is not important */
// const cssnano = require('cssnano');
/* css browser prefixes */
// const autoprefixer = require('autoprefixer')({ browsers: browsers });
// const postcss = require('gulp-postcss');

// =============================================================================
// TASKS
// =============================================================================

/* Default task for command: $ gulp */
gulp.task('default', ['theme.config', 'watch'])

/* Watch task triggers all automated tasks when files change */
gulp.task('watch', function () {
  liveReload.listen()
  watch(files.watch.css, function () {
    gulp.start(['css'])
  })
  watch(files.watch.fonts, function () {
    gulp.start(['fonts', 'css'])
  })
})

/* CSS - Compile and Minify */
gulp.task('css', function () {
  // Only minify in production
  const lessPlugins = [lessGlob, lessFunctions, lessAutoprefix]
  if (isProduction || shouldMinify) lessPlugins.push(lessMinify)
  return gulp.src(files.css)
    .pipe(plumber(function (error) {
      gutil.log(error.message)
      this.emit('end')
    }))
    // Only include source map in development
    .pipe(hasSourcemap ? sourcemaps.init() : gutil.noop())
    .pipe(less({plugins: lessPlugins, javascriptEnabled: true}))
    .pipe(rename({basename: 'all'}))
    // Only include source map in development
    .pipe(hasSourcemap ? sourcemaps.write('.') : gutil.noop())
    .pipe(gulp.dest(files.build.css))
    .pipe(liveReload())
})

// FONTS - Copy to Distribution Folder
gulp.task('fonts', function () {
  return gulp.src(files.fonts)
    .pipe(plumber())
    .pipe(rename({dirname: ''})) // make folder structure flat
    .pipe(gulp.dest(files.build.fonts))
    .pipe(liveReload())
})

// theme.config - Symlink to Semantic UI config in library
gulp.task('theme.config', function () {
  const realFile = pwd + input + 'theme.config'
  const linkFile = themeConfigPath
  const file = require('fs')
  file.unlink(linkFile, function () {
    file.symlink(
      realFile,
      linkFile,
      function () { console.log('Symlinked ' + realFile) }
    )
  })
})
