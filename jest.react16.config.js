/**
 * React 16.14 floor leg -- the bottom of the declared peer range. Run with `npm run test:react16`, never
 * with bare `jest`. Mechanism, and the reason this shape rather than an aliased devDependency, in
 * scripts/fixtures/react-legacy/jest-config.js; the pinned versions in scripts/fixtures/react-legacy/floors.js.
 */
const legacyReactJestConfig = require('./scripts/fixtures/react-legacy/jest-config')
const { react16 } = require('./scripts/fixtures/react-legacy/floors')

module.exports = legacyReactJestConfig(react16)
