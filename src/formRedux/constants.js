import { CHANGE, ERROR, FINISH, START, SUBMIT, SUCCESS } from 'utils-pack'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const NAME = 'form'  // Namespace this module
export const ACTION_TYPE = '@@redux-form'
export const FORM_ACTION_TYPE = {
  [CHANGE]: 'CHANGE',
  [SUBMIT]: {
    [START]: `${ACTION_TYPE}/START_SUBMIT`,
    [FINISH]: `${ACTION_TYPE}/STOP_SUBMIT`,
    [SUCCESS]: `${ACTION_TYPE}/SET_SUBMIT_SUCCEEDED`,
    [ERROR]: `${ACTION_TYPE}/SET_SUBMIT_FAILED`
  }
}
