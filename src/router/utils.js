import React from 'react'
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

/**
 * Get Current Route Definition from Component Props (without ID)
 * @param {Object} props - React Component props
 * @param {String} [suffix] - string to append at the end, '/' for example
 * @returns {String} route - path without query ID and without the ending slash
 */
export function routeFrom (props, suffix = '') {
  let route = get(props, 'history.location.pathname', '')
  if (route && route.lastIndexOf('/') !== route.indexOf('/')) route = route.substr(0, route.lastIndexOf('/'))
  if (!route && props.router) route = props.router.pathname.replace('/[id]', '') // next.js
  return route + suffix
}

/**
 * Get Current Route URI Path from Component Props (without query string and hash)
 * @param {Object} props - React Component props
 * @returns {String} uri - path relative to TLD without query string and without string after `#`
 */
export function uriFrom (props) {
  let uri = get(props, 'history.location.pathname', '')
  if (!uri) {// next.js has no no reliable props to get pathname!
    if (typeof window !== 'undefined') uri = get(window, 'location.pathname', '')
  }
  return uri
}
