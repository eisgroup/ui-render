import { __BACKEND__ } from '../variables'
import { createLoggerMiddleware } from './middleware'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export default {
  // ...(__DEV__ && __CLIENT__) && {middleware: require('redux-logger').createLogger()},
  ...__BACKEND__ && { middleware: createLoggerMiddleware() }
}
