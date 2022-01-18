import { createNestedRoutes, ROUTE, ROUTE_BASE, ROUTES } from 'modules-pack/variables'

const _ROUTE = {
  DOCS: `${ROUTE_BASE}docs`,
  TEST_POLICY: `${ROUTE_BASE}test/policy`,
}
Object.assign(ROUTE, _ROUTE)

const _ROUTES = {
  FOR_DEFINITION: createNestedRoutes(ROUTE, {
    [ROUTE.DOCS]: '/:id?', // add id to this route
  }),
  FOR_NAV: [],
  WITHOUT_NAV: [
    ROUTE.TEST_POLICY,
  ]
}

Object.assign(ROUTES, _ROUTES)

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
