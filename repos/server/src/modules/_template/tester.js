import { __DEV__, NODE_ENV } from 'core/src/common/variables'

/**
 * INTEGRATION TESTS ===========================================================
 * =============================================================================
 */

/* Can run in Dev mode only because it affects database */
if (!__DEV__) {
  console.error(`❌  This file can run in dev mode only, currently in '${NODE_ENV}' mode`)
  process.exit(1)
}
// benchA({}, runTask, sagaFlow)
