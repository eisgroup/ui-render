import { createNestedRoutes, ROUTE, ROUTE_BASE, ROUTES } from 'modules-pack/variables'
import { _SHOULD_SHOW_TEST_ } from 'utils-pack'

ROUTE.DOCS = `${ROUTE_BASE}docs`
ROUTE.WEBSTUDIO = `${ROUTE_BASE}webstudio`
ROUTE.TEST_POLICY = `${ROUTE_BASE}test/policy`
ROUTES.FOR_DEFINITION = createNestedRoutes(ROUTE, {
  [ROUTE.DOCS]: '/:id?', // add id to this route
  [ROUTE.DEMO]: '/:id?', // add id to this route
  [ROUTE.WEBSTUDIO]: '/:id?', // add id to this route
})
ROUTES.FOR_NAV = [ // shown in Navigation
  {path: ROUTE.HOME, name: 'Features', icon: 'home'},
  {path: ROUTE.DOCS, name: 'Docs', icon: 'theme'},
  {path: ROUTE.DEMO, name: 'Demo', icon: 'test'},
  {path: ROUTE.WEBSTUDIO, name: 'WebStudio', icon: 'logo-symbol'},
]
// Pages without Navigation
ROUTES.WITHOUT_NAV = [
  ROUTE.TEST_POLICY,
]
if (_SHOULD_SHOW_TEST_) ROUTES.FOR_NAV.push(...[
  {path: ROUTE.TESTER, name: 'Tester', icon: 'test'},
  {path: ROUTE.THEME, name: 'Theme', icon: 'theme'},
])

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
