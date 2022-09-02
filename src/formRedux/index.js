import { change, Field, formValues, getFormValues, reducer, reduxForm, registerField, reset, submit } from 'redux-form'
import { Active } from 'ui-utils-pack' // produces smallest js bundle size
import * as asyncValidate from './asyncValidators'
import { ACTION_TYPE, NAME } from './constants'
import saga from './sagas'

/**
 * REDUX FORM EXPORTS ==========================================================
 * @Note:
 *  - redux-form produces extra 22 KB gzipped compared to react-final-form,
 *    however, it does not cause rerender of the entire form when input changes.
 *  - react-final-form can be fine tuned to only rerender individual inputs.
 *    @see: https://final-form.org/docs/react-final-form/examples/subscriptions
 *
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
