import { GraphQLScalarType } from 'graphql'
import { queryFields, Response } from 'modules-pack/graphql/server/resolver'
import mongoose from 'mongoose'
import { get, isString, last } from 'utils-pack'
import { isObjectID } from './types'

/**
 * GRAPHQL TYPE RESOLVERS ======================================================
 * =============================================================================
 */

export const ObjectID = new GraphQLScalarType({
  name: 'Id',
  description: 'Mongoose Object ID string`',
  serialize: value => value,  // value sent to the client
  parseValue (value) {return this._fromClient(value)},
  parseLiteral (ast) {return this._fromClient(ast.value)},
})
ObjectID._fromClient = function (value) {
  if (isObjectID(value)) return value
  throw Response.badRequest(`Invalid ${this.name} ${value}, must be a Mongoose Object ID (hexadecimal 12-byte identifier)`)
}

export default {
  ObjectID
}

/**
 * GRAPHQL RESOLVER DECORATORS =================================================
 * =============================================================================
 */

/**
 * Decorator to hydrate Mongoose returned Documents with queried Nested Collections for GraphQL Resolvers
 * It assumes that GraphQL nested query structure matches that of Mongoose schema.
 *
 * @example:
 *    // After Model.find* queries
 *   *@populated(CAT_FOREIGN_KEYS.STRING)
 *    cat (_, {id}) {
 *      return id ? Cat.findById(id) : null
 *    }
 *    // After Model.createOrUpdate query
 *   *@populated(CAT_FOREIGN_KEYS.STRING)
 *    cat (_, {entry}) {
 *      return Cat.createOrUpdate(entry)
 *    }
 *    // After document.save()
 *   *@populated(CAT_FOREIGN_KEYS.STRING)
 *    async cat (_, {entry}) {
 *      const instance = await Cat.findById(entry.id)
 *      return Object.assign(instance, entry).save()
 *    }
 *
 * @param {*[]} opts - Mongoose populate arguments,
 */
export function populated (...opts) {
  const [arg, ...options] = opts // the first argument is usually a foreign keys string, but it can be object of paths
  const foreignKeys = isString(arg) ? String(arg).split(' ') : [] // for now only handle the key string case
  return function (target, key, descriptor) {
    const func = descriptor.value
    descriptor.value = function (...args) {
      const result = func.apply(this, args)
      let _opts = opts

      // return result without populating if no foreign key queried
      if (foreignKeys.length) {
        const queriedFields = queryFields(last(args))
        const nestedFields = foreignKeys.filter(path => get(queriedFields, path))
        if (!nestedFields.length) return result
        _opts = [nestedFields.join(' '), ...options]
      }

      // populate the result with queried foreign keys
      return result instanceof mongoose.Query
        ? result.populate(..._opts)
        : (result instanceof Promise
            ? result.then(doc => doc instanceof mongoose.Document ? doc.populate(..._opts).execPopulate() : doc)
            : result
        )
    }
    return descriptor
  }
}
