/**
 * Setup entry for the React 19.3.0 leg (`jest.react19.config.js` / `npm run test:react19`).
 * Sibling of ./setup-react16.js and ./setup-react17.js; see ./harness.js for the mechanism and ./floors.js
 * for the pinned version.
 */
require('./harness')(require('./floors').react19)
