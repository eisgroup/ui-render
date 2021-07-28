import { Active, namespace } from 'utils-pack'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const GRAPHQL = 'GRAPHQL' // Namespace this module
export const GRAPHQL_SERVER = namespace(GRAPHQL, Active.SERVICE) // Namespace this module for backend
export const GQL_HIDDEN_FIELDS = [
  '__typename', 'creator', 'creatorId'
]
