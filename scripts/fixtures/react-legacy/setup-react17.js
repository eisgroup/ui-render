/**
 * Setup entry for the React 17.0.2 leg (`jest.react17.config.js` / `npm run test:react17`).
 * Sibling of ./setup-react16.js; see ./harness.js for the mechanism and ./floors.js for the pinned version.
 */
require('./harness')(require('./floors').react17)
