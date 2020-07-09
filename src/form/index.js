import { change, formValues, getFormValues, reducer, reduxForm, registerField, reset, submit } from 'redux-form' // produces smallest js bundle size
import * as asyncValidate from './asyncValidators'
import { ACTION_TYPE, NAME } from './constants'
import './renders' // to trigger all definitions
import saga from './sagas'

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
  reset,
  submit,
}

const form = {
  NAME,
  ACTION_TYPE,
  reducer,
  saga,
  change,
  registerField,
}

export default form
