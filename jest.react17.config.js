/**
 * React 17.0.2 leg -- the middle of the declared peer range, same shape as jest.react16.config.js. Run with
 * `npm run test:react17`, never with bare `jest`. Mechanism in
 * scripts/fixtures/react-legacy/jest-config.js; the pinned versions in scripts/fixtures/react-legacy/floors.js.
 */
const legacyReactJestConfig = require('./scripts/fixtures/react-legacy/jest-config')
const { react17 } = require('./scripts/fixtures/react-legacy/floors')

module.exports = legacyReactJestConfig(react17)
