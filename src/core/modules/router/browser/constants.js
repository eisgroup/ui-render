import { CHANGE } from 'ui-utils-pack'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const ACTION_TYPE = '@@router' // for react-router
export const ROUTER_ACTION_TYPE = {
  [CHANGE]: `${ACTION_TYPE}/LOCATION_CHANGE`
}
