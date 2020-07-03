import { __BACKEND__ } from 'utils-pack'
import { createLoggerMiddleware } from './middleware'

/**
 * LOGGER ======================================================================
 * @Usage:
 *    - Node.js: logs Redux actions to console, color coded to different types
 *
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

const logger = {
  // ...(__DEV__ && __CLIENT__) && {middleware: require('redux-logger').createLogger()}, // direct console.log output
  ...__BACKEND__ && { middleware: createLoggerMiddleware() }
}

export default logger
