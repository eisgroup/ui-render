import { get, isId } from 'ui-utils-pack'

/**
 * Get Route ID from Component Props
 * @Note: react-router does not update props `location` or `match` with history.push
 *    => derive ID from history object directly for consistent API in all platforms
 * @param {Object} props - React Component props
 * @returns {String|Undefined} ID - from route location path, if found
 */
export function idFromRoute (props) {
  const id = slugFromRoute(props)
  if (isId(id)) return id
}

/**
 * Get Route Slug from Component Props
 * @Note: see idFromRoute for logic explanation, this one gets the last URI part.
 * @example: '/blog/page' -> results in slug = 'page'
 * @param {Object} props - React Component props
 * @returns {String|Undefined} slug - from route location path, if found
 */
export function slugFromRoute (props) {
  let id = get(props, 'history.location.pathname', '')
  if (id) id = id.substr(id.lastIndexOf('/') + 1)
  if (!id && props.router) id = get(props.router, 'query.id') // next.js
  return id
}
