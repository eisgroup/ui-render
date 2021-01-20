import { CHANGE } from 'utils-pack'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const ROUTER = 'router'  // Namespace this module
export const ACTION_TYPE = '@@router'
export const ROUTER_ACTION_TYPE = {
  [CHANGE]: `${ACTION_TYPE}/LOCATION_CHANGE`
}
