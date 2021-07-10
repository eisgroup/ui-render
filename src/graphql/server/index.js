import { assertBackend } from 'utils-pack'
import { GRAPHQL_SERVER } from '../constants'
import schema from '../schema.gql'
import resolver from './resolvers'

/**
 * EXPORTS FOR BACKEND ONLY ====================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */
assertBackend()

export * from './decorator'
export * from './resolver'
const graphqlServer = {
  NAME: GRAPHQL_SERVER,
  resolver,
  schema,
}

export default graphqlServer
