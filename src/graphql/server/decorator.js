import { __PROD__, Active, classInstanceMethodNames, get, isList, l, localiseTranslation, toJSON } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import { Response } from './resolver'

/**
 * GRAPHQL RESOLVER DECORATORS =================================================
 * =============================================================================
 */

localiseTranslation({
  PLEASE_ADD_decorator_BEFORE_USING_func: {
    [l.ENGLISH]: 'Please add @{decorator} before using @{func}',
  },
  YOU_CANNOT_ACCESS_PROTECTED_RESOURCE: {
    [l.ENGLISH]: 'You cannot access protected resource',
  }
})

/**
 * GraphQL Decorator to Export Resolvers Object using Class-style Syntax
 * @example:
 *    const resolvers = {}
 *   *@exportTo.Query(resolvers)
 *    class Query { // note that class Query.name will not be 'Query' when bundled by webpack in backend
 *      user (parent, args, context, info) {
 *        // ...resolver logic
 *      }
 *    }
 *    export default resolvers
 *
 * @param {String} Name - resolver to extend, one of ['Query', 'Mutation', 'Subscription']
 * @param {Object} resolvers - plain js object to be used as GQL resolvers for Query, Mutation, Subscription...
 * @returns {(function(*=): void)|*} decorator - that converts Class-style methods to plain object resolvers for GQL
 */
export function exportTo (Name, resolvers) {
  return function Decorator (Class) {
    const instance = new Class()
    const nestedResolvers = {}
    classInstanceMethodNames(Class).forEach(resolver => nestedResolvers[resolver] = instance[resolver])
    if (Name) {
      resolvers[Name] = nestedResolvers
    } else {
      Object.assign(resolvers, nestedResolvers)
    }
  }
}

// @see: exportTo() docs
exportTo.Query = function (...args) {
  return exportTo('Query', ...args)
}
// @see: exportTo() docs
exportTo.Mutation = function (...args) {
  return exportTo('Mutation', ...args)
}
// @see: exportTo() docs
exportTo.Subscription = function (...args) {
  return exportTo('Subscription', ...args)
}

/**
 * Decorator to Enforce Existence of Logged in User ID for GraphQL Resolvers
 * @example:
 *    class Query {
 *     *@authenticated
 *      user (parent, args, context, info) {
 *        // ...resolver logic
 *      }
 *    }
 */
export function authenticated (target, key, descriptor) {
  const func = descriptor.value
  descriptor.value = function (...args) {
    const [_1, _2, {user: {id} = {}}] = args
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
      const [_1, _2, {user: {auth} = {}}] = args
      if (!(auth >= userRole)) return Response.forbidden(_.YOU_CANNOT_ACCESS_PROTECTED_RESOURCE)
      return func.apply(this, args)
    }
    return descriptor
  }
}

/**
 * Decorator to Delay GraphQL Resolvers for Testing Purpose
 * @example: see `authenticated` decorator
 * @param {Number} milliseconds - to delay
 */
export function delayed (milliseconds) {
  return function (target, key, descriptor) {
    if (__PROD__) return descriptor
    const func = descriptor.value
    descriptor.value = function (...args) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(func.apply(this, args))
          } catch (error) {
            reject(error)
          }
        }, milliseconds)
      })
    }
    return descriptor
  }
}

/**
 * Decorator to Standardize Query `filter` and `match` variables for GraphQL Resolvers
 * (mutates payload `filter` if `match` Operator provided)
 * @example: see `authenticated` decorator
 * @param {Function} [validator] - validation function, receives (resolverArgs) as arguments,
 *    should return error Response in case of invalid, else void if validation passed
 * @param {Function<Function>} [filtersToApply] - filter mutations to apply, for example: defaultFilter(resolverArgs)
 */
export function filtered (validator, ...filtersToApply) {
  return function (target, key, descriptor) {
    const func = descriptor.value
    descriptor.value = async function (...args) {
      for (const filterTo of filtersToApply) {
        filterTo.apply(this, args)
      }
      if (validator) {
        const error = await validator.apply(this, args)
        if (error) return error
      }
      const [_1, payload] = args
      const {filter, match} = payload
      if (filter && match) {
        const conditions = []
        for (const field in filter) {
          conditions.push({[field]: filter[field]})
        }
        // Mutate filter so resolver can insert it directly to Model.find(filter)
        payload.filter = {[`$${match}`]: conditions}
      }
      return func.apply(this, args)
    }
    return descriptor
  }
}

/**
 * Decorator to Process Localised Strings (by mutation) for GraphQL Resolvers
 *    - Injects `user.lang` or `lang` from Context to the `entry.lang` Payload argument
 *    - Injects language code to returned doc/s for resolving entry virtual getters/setters
 * @default: fallbacks to active language code used by the application
 * @example: see `authenticated` decorator
 */
export function localised (target, key, descriptor) {
  const func = descriptor.value
  descriptor.value = async function (...args) {
    const [_1, payload, {user = {}, lang}] = args
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

/**
 * Validate that Localised field with `required: true` must have at least one translated value
 * @example:
 *    @verified(requiredLocalised(tagSchema))
 *
 * @param {Object} schema - Mongoose schema definition plain object
 * @returns {Function} validator - that takes GQL resolverArgs aa arguments
 */
export function requiredLocalised (schema) {
  if (!schema._.required) throw new Error(`${requiredLocalised.name} not needed for schema \n${toJSON(schema, null, 2)}`)
  return function validation (_1, {entry}) {

    if (!entry._) {
      // Skip check for existing entry if LocalString is not updated directly
      if (entry.id) return

      // Enforce LocalString for new entries (i.e. without Id)
      const fields = schema._.type
      let requiredFields = []
      for (const name in fields) {
        if (fields[name].required) requiredFields.push(name)
      }
      return Response.badRequest(`[${requiredFields.join(', ')}] ${_.REQUIRED}`)
    }

    // If Localised _ object given, assume it must contain all required LocalString values
    const localised = entry._
    for (const field in localised) {
      if (!get(schema, `_.type[${field}].required`)) continue

      let isValid = false
      const localString = localised[field]
      for (const lang in localString) {
        if (localString[lang]) {
          isValid = true
          break
        }
      }

      if (!isValid) return Response.badRequest(`[${field}] ${_.REQUIRED}`)
    }
  }
}

/**
 * Decorator to Run Validations for GraphQL Resolvers
 * @example: see `authenticated` decorator
 * @param {Function<Function>} [validators] - functions to run, each receives (resolverArgs) as arguments,
 *    should return error Response in case of invalid, else void if validation passed
 */
export function verified (...validators) {
  return function (target, key, descriptor) {
    const func = descriptor.value
    descriptor.value = async function (...args) {
      for (const validator of validators) {
        const error = await validator.apply(this, args)
        if (error) return error
      }
      return func.apply(this, args)
    }
    return descriptor
  }
}
