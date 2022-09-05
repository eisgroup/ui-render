import { CHANGE } from 'ui-utils-pack'
import { ROUTER_ACTION_TYPE } from './constants'

/**
 * Check if Action is of Router Action Type with Matching Result
 *
 * @param {string} ROUTE - pathname of the route to match
 * @param {string} ACTION - one of the ROUTE_ACTIONS constants
 * @return {function(action)} - function that accepts a single action argument to check against
 *    @function return: {boolean} - whether the action provided matches action type
 */
export function isRouterActionType (ROUTE, ACTION = CHANGE) {
  return (action) => {
    const {type = '', payload: {pathname} = {}} = action
    return (ROUTE === pathname) &&
      (new RegExp(`^${ROUTER_ACTION_TYPE[ACTION]}`).test(type))
  }
}
