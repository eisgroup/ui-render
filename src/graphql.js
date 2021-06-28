import { SevenBoom as Response } from 'graphql-apollo-errors'
import { Active } from './_envs'
import { isList } from './array'

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

/**
 * HOC Decorator to Process Localised Strings (by mutation) for GraphQL Resolvers
 *    - Injects `user.lang` or `lang` from Context to the `entry.lang` Payload argument
 *    - Injects language code to returned doc/s for resolving entry virtual getters/setters
 * @default: fallbacks to active language code used by the application
 * @example: see `authenticated` decorator
 */
export function localised (target, key, descriptor) {
  const func = descriptor.value
  descriptor.value = async function (...args) {
    const [_, payload, {user = {}, lang}] = args
    const langCode = user.lang || lang || Active.LANG._
    // .lang prop must be the first in entry object for virtuals to work, because of Object.assign order
    if (payload.entry && payload.entry.lang == null) payload.entry = {lang: langCode, ...payload.entry}
    const result = await func.apply(this, args)
    if (isList(result)) {
      result.forEach(entry => {entry.lang = langCode})
    } else if (result) {
      result.lang = langCode
    }
    return result
  }
  return descriptor
}
