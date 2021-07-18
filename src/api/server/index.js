import { API_SEVER } from '../constants'
import schema from '../schema.gql'
import Model from './models'
import resolver from './resolvers'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './validators'
export default {
  NAME: API_SEVER,
  Model,
  schema,
  resolver
}
