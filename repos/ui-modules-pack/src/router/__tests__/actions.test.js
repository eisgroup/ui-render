import { ROUTE } from 'ui-modules-pack/variables'
import { CHANGE } from 'ui-utils-pack'
import { isRouterActionType } from '../browser/actions'
import { ROUTER_ACTION_TYPE } from '../browser/constants'

it(`${isRouterActionType.name}() matches correct action type`, () => {
  const action = {type: ROUTER_ACTION_TYPE[CHANGE], payload: {pathname: ROUTE.TESTER}}
  expect(isRouterActionType(ROUTE.HOME)(action)).toBe(false)
  expect(isRouterActionType(ROUTE.TESTER)(action)).toBe(true)
  expect(isRouterActionType(ROUTE.HOME, CHANGE)(action)).toBe(false)
  expect(isRouterActionType(ROUTE.TESTER, CHANGE)(action)).toBe(true)
})
