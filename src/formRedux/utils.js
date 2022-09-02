import { withFormSetup } from 'modules-pack/form/utils'
import { stateAction } from 'modules-pack/redux'
import { FIELD } from 'modules-pack/variables/fields'
import React from 'react'
import { formValueSelector, getFormValues, reduxForm } from 'redux-form' // produces smallest js bundle size
import { Active, GET, get, hasListValue, isEmpty } from 'ui-utils-pack'
import { FORM_ASYNC_VALIDATE } from '../form/constants'
import { NAME } from './constants'

// import { apolloForm as apolloReduxForm } from '@fundflow/apollo-redux-form'
// import { schema } from '../../../server/modules/schemas'  // Note: this will expose GraphQL schema to frontend bundle

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

export function fieldValues (formName) {
  return getFormValues(formName)(Active.store.getState())
}

/**
 * Get Form's Registered Field Values
 *
 * @param {String} formName - to get values for
 * @returns {Object|Boolean|Undefined} values - nested mapping of field values by their name, or `false` if no field values found
 */
export function registeredFieldValues (formName) {
  const state = Active.store.getState()
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
  const state = Active.store.getState()
  return get(state, `${NAME}.${formName}.syncErrors`)
}

/**
 * HELPER FUNCTIONS ============================================================
 * =============================================================================
 */

/**
 * React Component Redux-Form Decorator with getters to detect form input changes
 * @note:
 *  - cannot wrap connected to redux component, @connect must be declared before
 * @usage:
 *  Below methods only work when using this.renderInput(FIELDS),
 *  or apply <Input onChange={this.handleChangeInput.bind(this)}/> manually:
 *  - this.canSave - getter boolean: true if form has input changes, no validation error exists, and is not loading
 *  - this.changedValues - getter object: key value pairs of form input values that have changed since initial values
 *  - this.registeredValues - getter object: key value pairs of registered form input values
 *  - this.formValues - getter object: key value pairs of all form input values
 *  - this.renderInput(FIELDS) - function: to render form inputs using FIELDS definition (hooks `onChange` to inputs)
 *  - this.props.onChangeState - function: callback when internal state changes, receives this class instance,
 *        or {} on unmount. This is useful for nested forms with remote submit button within parent container.
 *
 * @helpers:
 *  - this.handleChangeInput() - function: that triggers input changes update (hooked to this.renderInput)
 *  - this.syncInputChanges() - function: can be called manually to update input changes state, and force re-rendering
 *
 * @example:
 *    @connect(mapStateToProps)
 *    @withFormRedux({form: USER})
 *    export default class UserEdit extends Component {
 *      state = {
 *        company: {}
 *      }
 *      render = () => (
 *        <View>
 *          <Company onChangeState={(instance) => this.setState({company: instance})} />
 *          <Button disabled={!this.state.company.canSave}>Save<Button/>
 *        </View>
 *      )
 *    }
 *
 * @param {String} form - NAME, used by redux-form
 * @param {Object} [options - redux-form HOC options
 * @returns {Function} decorator - HOC wrapper function for given React component
 */
export function withFormRedux ({form, ...options}) {
  return function Decorator (Class) {
    withFormSetup(Class, {fieldValues, registeredFieldValues, registeredFieldErrors})
    return reduxForm({form, enableReinitialize: true, ...options})(Class)
  }
}

/**
 * Handles async validation of fields for a redux-form component as the form is being filled out
 *
 * @example
 *  FormView = reduxForm({
 *    form: CONTACT,
 *    asyncValidate: asyncValidateForm,
 *  })(FormView);
 *
 * @param {Object} values - The current form values
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} props - All the props given to the redux-form wrapped component
 * @param {String} blurredField - The name of the field that was blurred
 * @returns {Promise} - A promise that will be resolved with an object specifying any errors
 */
export function asyncValidateForm (values, dispatch, props, blurredField) {
  return new Promise((resolve) => {
    const existingAsyncErrors = props.asyncErrors || {}
    const asyncValidators = get(FIELD, `${blurredField}.validateAsync`, [])
    if (!hasListValue(asyncValidators)) return resolve(existingAsyncErrors)

    // Add blurred field to async validator descriptors
    const blurredFieldValue = values[blurredField]
    const items = asyncValidators.map((asyncValidator) => {
      const validatorDescriptor = asyncValidator(blurredFieldValue, values)
      return {
        ...validatorDescriptor,
        field: blurredField
      }
    })

    // Dispatch action to run async validation via sagas
    dispatch(stateAction(FORM_ASYNC_VALIDATE, GET, {
      items,
      callback: (errors) => resolve({...existingAsyncErrors, ...errors})
    }))
  })
}

/**
 * Apollo Redux Form Wrapper (disabled because of breaking changes in graphql 0.13)
 *
 * @param {Object} gqlOperation - a GraphQL executable Query, Mutation or Subscription
 * @param {Object} [options] - to pass to Apollo Redux Form library
 */
// export function apolloForm (gqlOperation, options = {}) {
//   if (!options.schema) options.schema = schema
//   if (!options.renderers) options.renderers = renderers
//   return apolloReduxForm(gqlOperation, options)
// }
