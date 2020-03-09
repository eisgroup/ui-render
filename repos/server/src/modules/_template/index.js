import { NAME } from './constants'
import resolver from './resolvers'
import schema from './schema.gql'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export default {
  NAME,
  resolver,
  schema,
}
