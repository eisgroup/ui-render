import { assertBackend } from 'ui-utils-pack'
import { PLACE_SERVER } from '../constants'
import schema from '../schema.gql'
import Model from './models'

/**
 * EXPORTS FOR BACKEND ONLY ====================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */
assertBackend()

export * from './validators'
const placeServer = {
  NAME: PLACE_SERVER,
  Model,
  schema,
}

export default placeServer
