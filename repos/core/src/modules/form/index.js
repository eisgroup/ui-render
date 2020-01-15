import { change, formValues, getFormValues, reducer, reduxForm, registerField, submit } from 'redux-form' // produces smallest js bundle size
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
