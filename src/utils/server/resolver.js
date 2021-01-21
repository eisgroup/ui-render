import { Kind } from 'graphql/language'
import { SERVER } from 'modules-pack/variables'

/**
 * GRAPHQL RESOLVER HELPERS ====================================================
 * =============================================================================
 */

/**
 * Wrapper for Resolver Functions to return cached results
 *
 * @example:
 *    // Inside GraphQL resolver:
 *    const query = Event.betweenTimeRange.bind(Event, start, end, published)
 *    return ((start || end) ? query() : cachedQuery(`eventsBetween`, query))
 *
 * @param {String} id - query ID to store/retrieve cache
 * @param {Function} callback - async method that returns the result to be cached
 * @param {Number} [cacheTime] - duration in milliseconds
 * @returns {Promise<*>}
 */
export async function cachedQuery (id, callback, cacheTime = SERVER.QUERY_CACHE_TIME) {
  cachedQuery.clean(cacheTime)
  const cached = cachedQuery.by[id]
  if (cached && cached.time > Date.now() - cacheTime) return cached.result
  const result = await callback()
  cachedQuery.by[id] = {result, time: Date.now()}
  return result
}

cachedQuery.by = {} // {'queryId': {result, time}}
cachedQuery.clean = function (cacheTime = SERVER.QUERY_CACHE_TIME) {
  const expireTime = Date.now() - cacheTime
  for (const id in this.by) {
    const {time} = this.by[id]
    if (time <= expireTime) delete this.by[id] // free up memory
  }
}

/**
 * GraphQL Scalar Type function to parse JSON literal
 */
export function parseLiteral (ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value

    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value)

    case Kind.OBJECT:
      return parseObject(ast, variables)

    case Kind.LIST:
      return ast.values.map(function (n) {
        return parseLiteral(n, variables)
      })

    case Kind.NULL:
      return null

    case Kind.VARIABLE: {
      const name = ast.name.value
      return variables ? variables[name] : undefined
    }

    default:
      return undefined
  }
}

function parseObject (ast, variables) {
  const value = Object.create(null)
  ast.fields.forEach(function (field) {
    // eslint-disable-next-line no-use-before-define
    value[field.name.value] = parseLiteral(field.value, variables)
  })
  return value
}

