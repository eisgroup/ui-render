import { ROUTE_BASE } from 'core/src/common/variables'
import { createNestedRoutes, ROUTE, ROUTES } from 'ui-modules-pack/variables'

const _ROUTE = {
  DOCS: `${ROUTE_BASE}docs`,
  ROCKET: `${ROUTE_BASE}rocket`,
}
Object.assign(ROUTE, _ROUTE)

const _ROUTES = {
  FOR_DEFINITION: createNestedRoutes(ROUTE, {
    [ROUTE.DOCS]: '/:id?',
  }),
}

Object.assign(ROUTES, _ROUTES)
