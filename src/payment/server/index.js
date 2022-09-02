import { assertBackend } from 'ui-utils-pack'
import { PAYMENT_SERVER } from '../constants'
import schema from '../schema.gql'
import resolver from './resolvers'

/**
 * EXPORTS FOR BACKEND ONLY ====================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */
assertBackend()

const paymentServer = {
  NAME: PAYMENT_SERVER,
  resolver,
  schema,
}

export default paymentServer
