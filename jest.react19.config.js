/**
 * React 19.3.0 leg -- the top of the declared peer range, above the installed 18. Same shape as
 * jest.react16.config.js and jest.react17.config.js, and run the same way: `npm run test:react19`, never bare
 * `jest`. Mechanism in scripts/fixtures/react-legacy/jest-config.js; the pinned versions, and what this leg
 * does differently from the older two, in scripts/fixtures/react-legacy/floors.js.
 */
const legacyReactJestConfig = require('./scripts/fixtures/react-legacy/jest-config')
const { react19 } = require('./scripts/fixtures/react-legacy/floors')

module.exports = legacyReactJestConfig(react19)
