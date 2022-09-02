import { GraphQLScalarType } from 'graphql'
import { queryFields, Response } from 'ui-modules-pack/graphql/server/resolver'
import mongoose from 'mongoose'
import { get, interpolateString, isString, l, last, localiseTranslation } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
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
    descriptor.value = async function (...args) {
      let instance = func.apply(this, args)
      let _opts = opts

      // Return result without populating if no foreign key queried
      if (foreignKeys.length) {
        const queriedFields = queryFields(last(args))
        const nestedFields = foreignKeys.filter(path => get(queriedFields, path))
        if (!nestedFields.length) return instance
        _opts = [nestedFields.join(' '), ...options]
      }

      // Populate the result with queried foreign keys
      if (instance instanceof Promise) {
        try { // needed to catch inside model.save() because MongoDB returns non-standard error object, resulting in 500
          instance = await instance
        } catch (error) {
          const errMsg = String(error)
          if (errMsg.indexOf('MongoServerError: E11000 duplicate key error collection') === 0) {
            return Response.badRequest(interpolateString(_.DUPLICATE_FOUND_FOR_UNIQUE_FIELD_value, {
              value: errMsg.split(' dup key: ').pop(),
            }, {suppressError: true}))
          }
          return Response.badRequest(error)
        }
      }
      if (instance instanceof mongoose.Query) return instance.populate(..._opts)
      if (instance instanceof mongoose.Document) return instance.populate(..._opts)//.execPopulate() removed in Mongoose 6
      return instance
    }
    return descriptor
  }
}

localiseTranslation({
  DUPLICATE_FOUND_FOR_UNIQUE_FIELD_value: {
    [l.ENGLISH]: 'Duplicate found for unique field: {value}',
  },
})
