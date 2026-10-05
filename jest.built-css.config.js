/**
 * The published stylesheet, checked after `npm run build-lib`: `npm run test:css:built`, which is the CI
 * step "Check the built stylesheet". `css.pipeline.parity.test.js` skips its artifact block when nothing is
 * built. That is right before a build, and it was all CI ever did, because CI runs jest before `build-lib`.
 * Under this config a missing `static/all.css` fails instead: a skip would pass an artifact that is not there.
 */
const base = require('./jest.config')

module.exports = {
    ...base,
    testMatch: ['<rootDir>/src/style/__tests__/css.pipeline.parity.test.js'],
    globals: { REQUIRE_BUILT_CSS: true },
}
