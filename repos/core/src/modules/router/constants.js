import { CHANGE } from '../../common/constants'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const NAME = 'router'  // Namespace this module
export const ACTION_TYPE = '@@router'
export const ROUTER_ACTION_TYPE = {
  [CHANGE]: `${ACTION_TYPE}/LOCATION_CHANGE`
}
