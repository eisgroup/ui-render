import { warn } from 'ui-utils-pack'
import { FORM_ACTION_TYPE } from './constants'

/**
 * ACTION CREATORS =============================================================
 * =============================================================================
 */

/**
 * Check if Action is of Form Action Type with Matching Result
 *
 * @param {string} FORM - name of the form to match
 * @param {string} ACTION - one of the FORM_ACTIONS constants
 * @param {string} RESULT - one of the FORM_RESULTS constants
 * @returns {function(action)} - function that accepts a single action argument to check against
 *    @function return: {boolean} - whether the action provided matches action type
 */
export function isFormActionType (FORM, ACTION, RESULT) {
  if (!ACTION || !RESULT) warn('isFormActionType() expects `ACTION` and `RESULT` arguments')

  return (action) => {
    const {type = '', meta = {}} = action
    return (meta.form === FORM) &&
      (new RegExp(`^${FORM_ACTION_TYPE[ACTION][RESULT]}`).test(type))
  }
}
