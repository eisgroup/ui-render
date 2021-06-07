import { SevenBoom as Response } from 'graphql-apollo-errors'

/**
 * GRAPHQL HELPERS =============================================================
 * =============================================================================
 */

export { Response }

/**
 * Decorator to Enforce Existence of Logged in User ID for GraphQL Resolvers
 * @example:
 *    class Query {
 *      @authenticated
 *      user(parent, args, context, info) {
 *        // ...resolver logic
 *      }
 *    }
 */
export function authenticated (target, key, descriptor) {
  const func = descriptor.value
  descriptor.value = function (...args) {
    const [_, __, {user: {id} = {}}] = args
    if (!id) return Response.unauthorized(id)
    return func.apply(this, args)
  }
  return descriptor
}

/**
 * Decorator to Enforce Minimum Authorization Level of Logged in User for GraphQL Resolvers
 * @example: see `authenticated` decorator
 * @param {Number} userRole - one of ENUM.USER_ROLE, the minimum authorization level required
 */
export function authLevel (userRole) {
  return function (target, key, descriptor) {
    const func = descriptor.value
    descriptor.value = function (...args) {
      const [_, __, {user: {id, auth} = {}}] = args
      if (!(auth >= userRole)) return Response.unauthorized(id)
      return func.apply(this, args)
    }
    return descriptor
  }
}
