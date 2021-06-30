import { _SHOULD_SHOW_TEST_, findObjByKeys } from 'utils-pack'

/* Routes */
export const ROUTE_HOME = '/'
export const ROUTE_SLASH = ROUTE_HOME.slice(-1) === '/' ? '' : '/' // used when ROUTE_HOME does not end with `/`
export const ROUTE_BASE = `${ROUTE_HOME}${ROUTE_SLASH}`

export const ROUTE = {
  HOME: ROUTE_HOME,
  DEMO: `${ROUTE_BASE}demo`,
  PRIVACY: `${ROUTE_BASE}privacy`,
  TESTER: `${ROUTE_BASE}tester`, // for development only
  THEME: `${ROUTE_BASE}theme`, // for development only
}

export const ROUTES = {
  NAV_HEADER_MAX_LINKS: 5, // show up to 5 links in Header navigation

  // used for Routes definition
  FOR_DEFINITION: createNestedRoutes(ROUTE, {
    [ROUTE.DEMO]: '/:id?', // add id to this route
  }),

  // shown in Navigation
  FOR_NAV: [
    {path: ROUTE.HOME, name: 'Home', icon: 'home'},
  ],

  // not shown in Navigation
  WITHOUT_NAV: [],

  // ID for new EntryEdit
  NEW: 'new'
}

if (_SHOULD_SHOW_TEST_) ROUTES.FOR_NAV.push(...[
  {path: ROUTE.TESTER, name: 'Tester', icon: 'test'},
  {path: ROUTE.THEME, name: 'Theme', icon: 'theme'},
])

/**
 * HELPER FUNCTIONS ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Automatically Nest Routes based on their URI path names
 * @example:
 *    const ROUTE = {ABOUT: '/about', CONTACT: '/about/contact'}
 *    const ROUTES = createNestedRoutes(ROUTE, {[ROUTE.ABOUT]: '/:id?'})
 *    >>> ROUTES[
 *      {path: '/about/:id?', name: 'About', items: [
 *        {path: '/about/contact', name: 'Contact'},
 *      ]},
 *    ]
 */
export function createNestedRoutes (routeObj, matches = {}) {
  const result = []
  for (const key in routeObj) {
    const path = routeObj[key]
    const uris = path.split('/')
    const title = uris.pop().replace(/-/g, ' ') || 'Homepage'
    const name = title.charAt(0).toUpperCase() + title.slice(1)  // capitalise first letter
    const parentPath = uris.join('/')
    const parentRoute = findObjByKeys(result, {path: parentPath})
    const route = {path, name}

    // Define nested route
    if (parentRoute) {
      parentRoute.items = (parentRoute.items || []).concat(route)
    } else {
      result.push(route)
    }
  }

  // Add route matches
  for (const path in matches) {
    const match = matches[path]
    findObjByKeys(result, {path}).path = path + match
  }

  return result
}
