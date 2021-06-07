import { classInstanceMethodNames } from './object'

/**
 * DECORATOR HELPERS ===========================================================
 * =============================================================================
 */

/**
 * GraphQL Decorator to Export Resolvers Object using Class-style Syntax
 * @example:
 *    const resolvers = {}
 *    @exportTo(resolvers)
 *    class Query {
 *      user(parent, args, context, info) {
 *        // ...resolver logic
 *      }
 *    }
 *    export default resolvers
 *
 * @param {Object} resolvers - plain js object to be used as GQL resolvers for Query, Mutation, Subscription...
 * @returns {(function(*=): void)|*} decorator - that converts Class-style methods to plain object resolvers for GQL
 */
export function exportTo (resolvers) {
  return function Decorator (Class) {
    const instance = new Class()
    const nestedResolvers = {}
    classInstanceMethodNames(Class).forEach(resolver => nestedResolvers[resolver] = instance[resolver])
    resolvers[Class.name] = nestedResolvers
  }
}
