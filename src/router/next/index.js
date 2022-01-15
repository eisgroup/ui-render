import { Active } from 'utils-pack'
import { ROUTER } from '../constants'
import select from '../selectors'
import reducer from './reducers'

/**
 * NEXT.JS ROUTER EXPORTS ======================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from '../constants'
export * from './data'
export {
  select
}

const router = {
  NAME: ROUTER,
  reducer,
  select,
  get activeRoute () {
    const {location: {pathname} = {}} = Active.history
    return pathname
  },
  get activeRouteId () {
    return (this.activeRoute || '').split(/\//).pop()
  }
}

export default router
