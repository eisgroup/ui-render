import { change, formValues, getFormValues, reducer, reduxForm, registerField, reset, submit } from 'redux-form' // produces smallest js bundle size
import * as asyncValidate from './asyncValidators'
import { ACTION_TYPE, NAME } from './constants'
import * as normalize from './normalizers'
import './renders' // to trigger all definitions
import saga from './sagas'
import * as validate from './validationRules'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export {
  change,
  reduxForm,
  registerField,
  asyncValidate,
  getFormValues,
  formValues,
  normalize,
  reset,
  submit,
  validate
}
export default {
  NAME,
  ACTION_TYPE,
  reducer,
  saga,
  change,
  registerField,
}
