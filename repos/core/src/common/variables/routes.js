import { createNestedRoutes, ROUTE, ROUTE_BASE, ROUTES } from 'modules-pack/variables'
import { _SHOULD_SHOW_TEST_ } from 'utils-pack'

ROUTE.DOCS = `${ROUTE_BASE}docs`
ROUTE.WEBSTUDIO = `${ROUTE_BASE}webstudio`
ROUTES.FOR_DEFINITION = createNestedRoutes(ROUTE, {
  [ROUTE.DEMO]: '/:id?', // add id to this route
  [ROUTE.WEBSTUDIO]: '/:id?', // add id to this route
})
ROUTES.FOR_NAV = [ // shown in Navigation
  {path: ROUTE.HOME, name: 'Features', icon: 'home'},
  {path: ROUTE.DOCS, name: 'Docs', icon: 'theme'},
  {path: ROUTE.DEMO, name: 'Demo', icon: 'test'},
  {path: ROUTE.WEBSTUDIO, name: 'WebStudio', icon: 'logo-symbol'},
]
if (_SHOULD_SHOW_TEST_) ROUTES.FOR_NAV.push(...[
  {path: ROUTE.TESTER, name: 'Tester', icon: 'test'},
  {path: ROUTE.THEME, name: 'Theme', icon: 'theme'},
])
