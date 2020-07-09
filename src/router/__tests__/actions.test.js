import { ROUTE } from 'modules-pack/variables'
import { CHANGE } from 'utils-pack'
import { isRouterActionType } from '../actions'
import { ROUTER_ACTION_TYPE } from '../constants'

it(`${isRouterActionType.name}() matches correct action type`, () => {
  const action = {type: ROUTER_ACTION_TYPE[CHANGE], payload: {pathname: ROUTE.TESTER}}
  expect(isRouterActionType(ROUTE.HOME)(action)).toBe(false)
  expect(isRouterActionType(ROUTE.TESTER)(action)).toBe(true)
  expect(isRouterActionType(ROUTE.HOME, CHANGE)(action)).toBe(false)
  expect(isRouterActionType(ROUTE.TESTER, CHANGE)(action)).toBe(true)
})
