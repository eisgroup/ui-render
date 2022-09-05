import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router'
import { Route } from 'react-router-dom'
import { ROUTER } from '../constants'
import select from '../selectors'
import { defineRoutes } from './components'
import { ACTION_TYPE } from './constants'
import history from './history'

/**
 * BROWSER ROUTER EXPORTS ======================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export { Switch } from 'react-router-dom'
export { withRouter } from 'react-router'
export * from '../utils'
export * from '../constants'
export * from './constants'
export * from './components'
export * from './actions'
export * from './history'
export {
  select
}

const router = {
  NAME: ROUTER,
  ACTION_TYPE,
  history,
  middleware: typeof window !== 'undefined' ? routerMiddleware(history) : {},
  reducer: typeof window !== 'undefined' ? connectRouter(history) : undefined,
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
