/**
 * Setup entry for the React 16.14 floor leg (`jest.react16.config.js` / `npm run test:react16`).
 *
 * A separate file per leg rather than one shared file parameterised through the environment: `jest`'s
 * `setupFilesAfterEnv` takes paths, and passing the expected version as an argument here keeps it a plain
 * value read from ./floors.js instead of process state that could go missing between parent and worker.
 * Everything else lives in ./harness.js -- including why none of this may move into the fixture package.
 */
require('./harness')(require('./floors').react16)
