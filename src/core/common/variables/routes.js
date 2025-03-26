import { createNestedRoutes, ROUTE, ROUTES } from 'ui-modules-pack/variables'
import { __PROD__, ENV } from 'ui-utils-pack'

export const ROUTE_BASE = __PROD__ ? `${ENV.REACT_APP_HOMEPAGE || ''}/` : '/'
const _ROUTE = {
  HOME: ROUTE_BASE,
  DOCS: __PROD__ ? ROUTE_BASE : `${ROUTE_BASE}docs`,
  TEST: `${ROUTE_BASE}test`
}
Object.assign(ROUTE, _ROUTE)

const _ROUTES = {
  FOR_DEFINITION: createNestedRoutes(ROUTE, {
    [ROUTE.DOCS]: __PROD__ ? ':id?' : '/:id?', // add id to this route
  }),
  FOR_NAV: [],
  WITHOUT_NAV: []
}

Object.assign(ROUTES, _ROUTES)
export { ROUTE, ROUTES }

export function goTo (uri, title = uri, page = uri) {
  if (typeof window === 'undefined') return
// eslint-disable-next-line no-restricted-globals
  if (typeof history === 'undefined') return
// eslint-disable-next-line no-restricted-globals
  if (typeof history.pushState !== 'undefined') {
// eslint-disable-next-line no-restricted-globals
    history.pushState({page: page}, title, uri)
  } else {
    window.location.assign(uri)
  }
}
