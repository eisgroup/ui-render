import { formValueSelector, getFormValues } from 'redux-form'
import { get, isEmpty } from '../../common/utils'
import { ACTIVE } from '../../common/variables'
import { NAME } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

export function fieldValues (formName) {
  return getFormValues(formName)(ACTIVE.store.getState())
}

/**
 * Get Form's Registered Field Values
 *
 * @param {String} formName - to get values for
 * @returns {Object|Boolean} values - nested mapping of field values by their name, or `false` if no field values found
 */
export function registeredFieldValues (formName) {
  const state = ACTIVE.store.getState()
  const registeredFieldNames = Object.values(get(state, `${NAME}.${formName}.registeredFields`, {})).map(f => f.name)
  if (!registeredFieldNames.length) return

  // Force returning object mapping of values, because redux form may return a single value
  if (registeredFieldNames.length === 1) registeredFieldNames.push('_')
  const values = formValueSelector(formName)(state, ...registeredFieldNames)
  return !isEmpty(values) && values
}

/**
 * Get Form's Registered Field Errors
 *
 * @param {String} formName - to get values for
 * @returns {Object|Undefined} errors - key values of field names and error messages
 */
export function registeredFieldErrors (formName) {
  const state = ACTIVE.store.getState()
  return get(state, `${NAME}.${formName}.syncErrors`)
}
