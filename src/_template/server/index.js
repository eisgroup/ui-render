import { _TEMPLATE_SERVER } from '../constants'
import schema from '../schema.gql'
// import Model from './models'
// import resolver from './resolvers'

/**
 * EXPORTS FOR BACKEND ONLY ====================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

const _templateServer = {
  NAME: _TEMPLATE_SERVER,
  // Model,
  // resolver,
  schema,
}

export default _templateServer
