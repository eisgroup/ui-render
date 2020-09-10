import { UI } from 'modules-pack/variables'
import { fieldsFrom } from 'modules-pack/variables/fields'
import PropTypes from 'prop-types'
import React from 'react'
import { Form } from 'react-final-form'
import Text from 'react-ui-pack/Text'
import Tooltip from 'react-ui-pack/Tooltip'
import View from 'react-ui-pack/View'
import { Active, debounce, isEmpty, isEqual, objChanges, toJSON, warn } from 'utils-pack'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

/**
 * Get Form's Field Values
 * @param {Object} form - instance from react-final-form
 * @return {Object} formValues - key values of field names and values
 */
export function fieldValues (form) {
  return form.getState().values
}

/**
 * Get Form's Registered Field Values
 *
 * @param {FormApi} form - instance from react-final-form
 * @returns {Object|Boolean|Undefined} values - nested mapping of field values by their name, or `false` if no field values found
 */
export function registeredFieldValues (form) {
  const registeredFieldNames = form.getRegisteredFields()
  if (!registeredFieldNames.length) return

  // Return object mapping of registered values,
  // unfilled fields are considered as non-registered.
  const values = {}
  registeredFieldNames.forEach(field => {
    const {value} = form.getFieldState(field)
    if (value != null) values[field] = value
  })
  return !isEmpty(values) && values
}

/**
 * Get Form's Registered Field Errors
 *
 * @param {FormApi} form - instance from react-final-form
 * @returns {Object|Boolean|Undefined} errors - key values of field names and error messages
 */
export function registeredFieldErrors (form) {
  const registeredFieldNames = form.getRegisteredFields()
  if (!registeredFieldNames.length) return

  // Return object mapping of registered field errors,
  // unfilled fields are considered as non-registered.
  const errors = {}
  registeredFieldNames.forEach(field => {
    const {error} = form.getFieldState(field)
    if (error != null) errors[field] = error
  })
  return !isEmpty(errors) && errors
}

/**
 * HELPER FUNCTIONS ============================================================
 * =============================================================================
 */

/**
 * React Component React Final Form Decorator with getters to detect form input changes:
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
 *    @withForm({subscription: {submitting: true, pristine: true}})
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
 * @param {FormProps|Object} [options] - for <Form/> see: https://final-form.org/docs/react-final-form/types/FormProps
 * @returns {Function} decorator - HOC wrapper function for given React component
 */
export function withForm (options = {subscription: {submitting: true, pristine: true}}) {
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

    return function WithForm (props) {
      return <Form enableReinitialize onSubmit={warn} {...options} {...props} component={Class}/>
    }
  }
}
