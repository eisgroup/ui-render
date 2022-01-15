import { ROUTE } from 'modules-pack'
import React from 'react'
import { withRouter } from 'react-router'
import { Link as ClientLink, Route } from 'react-router-dom'
import { onPressHoc, SOUND } from 'react-ui-pack'
import { Active, hasListValue } from 'utils-pack'
import { idFromRoute } from '../utils'

/**
 * Recursively Declare Browser Routes using Absolute Paths
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
 * Link HOC for react-router to play sound onClick
 */
export function Link ({onClick, sound = Active.SETTINGS.HAS_SOUND && SOUND.TOUCH, ...props}) {
  return <ClientLink onClick={onPressHoc(onClick, sound)} {...props}/>
}

/**
 *
 * React Component Decorator (HOC) to provide this.id getter that returns ID from Browser router pathname
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
