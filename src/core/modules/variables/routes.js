/* Routes */
export const ROUTE_HOME = '/'
export const ROUTE_SLASH = ROUTE_HOME.slice(-1) === '/' ? '' : '/' // used when ROUTE_HOME does not end with `/`
export const ROUTE_BASE = `${ROUTE_HOME}${ROUTE_SLASH}`

// Define only SSR/SPA routes here for navigating to external server (i.e. WordPress)
export const ROUTE = {
  HOME: ROUTE_HOME, // required fallback route when nothing matches
  TESTER: `${ROUTE_BASE}tester`, // for development only
  THEME: `${ROUTE_BASE}theme`, // for development only
  LOGIN: `${ROUTE_BASE}login`,
  LOGOUT: `${ROUTE_BASE}logout`,
}

export const ROUTES = {
  NAV_HEADER_MAX_LINKS: 5, // show up to 5 links in Header navigation

  // shown in Navigation
  FOR_NAV: [
    {path: ROUTE.HOME, name: 'Home', icon: 'home'},
  ],

  // not shown in Navigation
  WITHOUT_NAV: [],

  // ID for new EntryEdit
  NEW: 'new',
  LOGIN: 'login', // prevent GQL from querying it as Id
}

