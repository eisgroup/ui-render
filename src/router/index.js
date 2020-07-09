import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router'
import { Route } from 'react-router-dom'
import { ACTION_TYPE, NAME } from './constants'
import history from './history'
import select from './selectors'
import { defineRoutes, Link } from './utils'

/**
 * BROWSER ROUTER EXPORTS ======================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export {
  history,
  Link,
  select
}

const router = {
  NAME,
  ACTION_TYPE,
  history,
  middleware: routerMiddleware(history),
  reducer: connectRouter(history),
  Router: ConnectedRouter,
  Route,
  select,
  defineRoutes,
  get activeRoute () {
    const {location: {pathname} = {}} = history
    return pathname
  },
  get activeRouteId () {
    return (this.activeRoute || '').split(/\//).pop()
  }
}

export default  router
