import { Response } from 'modules-pack/graphql/server/resolver'
import { isEmpty } from 'utils-pack'

/**
 * VALIDATION HELPERS ==========================================================
 * =============================================================================
 */

/**
 * Validate if User can query ApiKey with given filters
 * @param {Object<String>} filter - query filter key/value pairs
 * @param {String} userId - ID of the User who is performing the action (must be from verified auth token)
 * @returns {Object<Error>|Undefined} error - if validation failed, else undefined if validation passed
 */
export function apiKeyQueryValidate (filter, userId) {
  if (isEmpty(filter))
    return Response.badRequest('ApiKey `filter` is required')
}
