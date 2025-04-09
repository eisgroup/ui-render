import { ROUTE } from 'ui-modules-pack'
import React from 'react'
import { Link as ClientLink, Route } from 'react-router-dom'
import { onPressHoc, SOUND } from 'ui-react-pack'
import { Active, hasListValue } from 'ui-utils-pack'

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
