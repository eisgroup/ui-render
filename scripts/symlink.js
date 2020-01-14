/*
 * Example:
 *    yarn symlink config-overrides.js repos/web/
 */
const file = require('fs')
const realFile = process.cwd() + '/' + process.argv[2] // first argument - the file relative to where command was made
const linkFile = process.argv[3] + process.argv[2] // second argument - the path to folder to link the file to
file.unlink(linkFile, function () {
  file.symlink(
    realFile,
    linkFile,
    function () { console.log('Symlinked ' + realFile) }
  )
})
