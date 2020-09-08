import { change, Field, formValues, getFormValues, reducer, reduxForm, registerField, reset, submit } from 'redux-form'
import { Active } from 'utils-pack' // produces smallest js bundle size
import * as asyncValidate from './asyncValidators'
import { ACTION_TYPE, NAME } from './constants'
import './renders' // to trigger all definitions
import saga from './sagas'

/**
 * REDUX FORM EXPORTS ==========================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

Active.Field = Field // use redux-form Field

export * from './constants'
export * from './actions'
export * from './utils'
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

const formRedux = {
  NAME,
  ACTION_TYPE,
  reducer,
  saga,
  change,
  registerField,
}

export default formRedux
