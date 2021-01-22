import { assertBackend } from 'utils-pack'
import { MEASUREMENT_SERVER } from '../constants'
import schema from '../schema.gql'
import resolver from './resolvers'

/**
 * EXPORTS FOR BACKEND ONLY ====================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */
assertBackend()

const measurementServer = {
  NAME: MEASUREMENT_SERVER,
  resolver,
  schema,
}

export default measurementServer
