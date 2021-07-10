import { ROUTE } from 'modules-pack/variables'
import React from 'react'
import { withRouter } from 'react-router'
import { Link as ClientLink, Route } from 'react-router-dom'
import { onPressHoc, SOUND } from 'react-ui-pack'
import { Active, get, hasListValue } from 'utils-pack'

/**
 * Recursively Declare Routes using Absolute Paths
 * @Note: this function expects js files to be found with matching route path from `pages` default export
 *
 * @param {Array} routes - list of nested routes, in this structure [{path, name, items}]
 * @param {Object} pages - pages by route name
 * @returns {Array} routes - flat list of React Route Components
 */
export function defineRoutes (routes, pages) {
  const results = []
  if (!hasListValue(routes)) return results
  routes.forEach(({path, items}) => {
    const route = (path.indexOf('/:') ? path.split('/:')[0] : path)
    results.push(<Route key={path} exact path={path} component={pages[route] || pages[ROUTE.HOME]}/>)
    if (hasListValue(items)) results.push(defineRoutes(items, pages))
  })
  return results
}

/**
 * Get Route ID from Component Props
 * @Note: react-router does not update props `location` or `match` with history.push
 *    => derive ID from history object directly for consistent API in all platforms
 * @param {Object} props - React Component props
 * @returns {String|Undefined} ID - from route location path, if found
 */
export function idFromRoute (props) {
  let id = get(props, 'history.location.pathname', '')
  if (id) id = id.substr(id.lastIndexOf('/') + 1)
  if (!id && props.router) id = get(props.router, 'query.id') // next.js
  return id
}

/**
 * Get Current Route from Component Props
 * @param {Object} props - React Component props
 * @param {String} [suffix] - string to append at the end, '/' for example
 * @returns {String} route - path without query ID and without the ending slash
 */
export function routeFrom (props, suffix = '') {
  let route = get(props, 'history.location.pathname', '')
  if (route) route = route.substr(0, route.lastIndexOf('/'))
  if (!route && props.router) route = props.router.pathname.replace('/[id]', '') // next.js
  return route + suffix
}

/**
 *
 * React Component Decorator (HOC) to provide this.id getter that returns ID from router pathname
 *
 * @example:
 *    https://example.com/user/edit/uuid
 *    this.id
 *    >>> 'uuid'
 *
 * @param {Class|Function} constructor - to be decorated
 * @param {Class|Function} constructor - class, wrapped using @withRouter decorator
 */
export function withRouteId (constructor) {
  // Define instance getter
  Object.defineProperty(constructor.prototype, 'id', {
    get () {
      return idFromRoute(this.props)
    }
  })
  return withRouter(constructor)
}

/**
 * Link HOC for react-router to play sound onClick
 */
export function Link ({onClick, sound = Active.SETTINGS.HAS_SOUND && SOUND.TOUCH, ...props}) {
  return <ClientLink onClick={onPressHoc(onClick, sound)} {...props}/>
}
