import { stateAction } from 'modules-pack/redux'
import { UI } from 'modules-pack/variables'
import { FIELD, fieldsFrom } from 'modules-pack/variables/fields'
import PropTypes from 'prop-types'
import React from 'react'
import Text from 'react-ui-pack/Text'
import Tooltip from 'react-ui-pack/Tooltip'
import View from 'react-ui-pack/View'
import { formValueSelector, getFormValues, reduxForm } from 'redux-form' // produces smallest js bundle size
import { Active, debounce, GET, get, hasListValue, isEmpty, isEqual, objChanges, toJSON } from 'utils-pack'
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
 * React Component Redux-Form Decorator with getters to detect form input changes:
 * @note: cannot wrap connected to redux component, @connect must be declared before
 * @usage
 *  - this.canSave - getter boolean: true if form has input changes, no validation error exists, and is not loading
 *  - this.changedValues - getter object: key value pairs of form input values that have changed since initial values
 *  - this.registeredValues - getter object: key value pairs of registered form input values
 *  - this.formValues - getter object: key value pairs of all form input values
 *  - this.renderInput(FIELDS) - function: to render form inputs using FIELDS definition (hooks `onChange` to inputs)
 *  - this.props.onChangeState - function: callback when internal state changes, receives this class instance,
 *        or {} on unmount. This is useful for nested forms with remote submit button within parent container.
 *
 * @helpers
 *  - this.state.hasInputChanges - boolean: true if current state has form input value changes
 *  - this.handleChangeInput() - function: that triggers input changes update (hooked to this.renderInput)
 *  - this.syncInputChanges() - function: can be called manually to update input changes state, and force re-rendering
 *
 *  @example:
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
    const componentDidUpdate = Class.prototype.componentDidUpdate
    const componentWillUnmount = Class.prototype.componentWillUnmount
    const handleChangeInput = Class.prototype.handleChangeInput

    Class.propTypes = {
      initialValues: PropTypes.object, // form initial values
      onChangeState: PropTypes.func, // onChangeState(this: Class)
      ...Class.propTypes
    }

    Class.prototype.state = {
      hasInputChanges: false,
      canSave: false, // only used internally to compare changes for re-rendering
      ...Class.prototype.state
    }

    // Define instance getter
    Object.defineProperty(Class.prototype, 'canSave', {
      get () {
        const {valid, loading} = this.props
        const {hasInputChanges} = this.state
        return hasInputChanges && valid && !loading
      }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'formValues', {
      get () {
        return fieldValues(this.props.form)
      }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'registeredValues', {
      get () {
        return registeredFieldValues(this.props.form)
      }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'changedValues', {
      get () {
        // Have to select all form values, because registered values may not include all input values
        return objChanges(this.props.initialValues, this.formValues)
      }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'validationErrorsTooltip', {
      get () {
        const errors = registeredFieldErrors(this.props.form)
        return errors && <Tooltip top>
          <View className='padding-h-smaller'>
            <Text className='margin-v-small bold'>Please complete:</Text>
            {(() => {
              const messages = []
              for (const k in errors) {
                messages.push(<Text key={k} className='margin-bottom-smaller'>{`- ${k}: ${toJSON(errors[k])}`}</Text>)
              }
              return messages
            })()}
          </View>
        </Tooltip>
      }
    })

    // Define instance method
    Class.prototype.renderInput = function (FIELDS, {onChange} = {}) {
      const {initialValues} = this.props
      return fieldsFrom(FIELDS, {initialValues})
        .map(field => ({
          ...field,
          onChange: (...args) => {
            field.onChange && field.onChange(...args)
            this.handleChangeInput(...args)
            onChange && onChange(...args)
          },
        }))
        .map(Active.renderField)
    }

    // Define instance method
    Class.prototype.handleChangeInput = debounce(function () {
      // To handle use case when all fields in a group are removed, and no registered values are sent to backend,
      // use placeholder parent field that reserves as registered null value field for the entire group.
      // See <Fields> component for example.
      this.syncInputChanges()
      if (handleChangeInput) handleChangeInput.apply(this, arguments)
    }, UI.TYPING_DELAY)

    // Define instance method
    Class.prototype.syncInputChanges = function () {
      // todo: Phase 2 - put back deleted flag from FieldsWithLevel
      const {initialValues, valid, loading} = this.props
      const registeredValues = this.registeredValues
      const hasInputChanges = (registeredValues && isEmpty(initialValues)) || !!this.changedValues
      const canSave = hasInputChanges && valid && !loading
      if (hasInputChanges !== this.state.hasInputChanges || canSave !== this.state.canSave) {
        this.setState({hasInputChanges, canSave})
        if (this.props.onChangeState) this.props.onChangeState(this)
      }
    }

    Class.prototype.componentDidUpdate = function (old) {
      if (!isEqual(old.initialValues, this.props.initialValues)) {
        this.syncInputChanges()
      }
      if (componentDidUpdate) componentDidUpdate.apply(this, arguments)
    }

    Class.prototype.componentWillUnmount = function () {
      if (this.props.onChangeState) this.props.onChangeState({})
      if (componentWillUnmount) componentWillUnmount.apply(this, arguments)
    }

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
