import { UI } from 'modules-pack/variables'
import { fieldsFrom } from 'modules-pack/variables/fields'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Field, Form } from 'react-final-form'
import { isRequired } from 'react-ui-pack/inputs/validationRules'
import Text from 'react-ui-pack/Text'
import Tooltip from 'react-ui-pack/Tooltip'
import View from 'react-ui-pack/View'
import { Active, debounce, isEmpty, isEqual, isEqualJSON, objChanges, set, toJSON, warn } from 'utils-pack'
import { _ } from 'utils-pack/translations'

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
    if (value != null) set(values, field, value) // use set() to convert nested paths to objects
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
 * Wrapper Proxy for react-final-form or redux-form Field with unified API.
 * @Note:
 *    - `normalize` does not exist in react-final-form, only `format` and `parse`
 *      => Make `format` and `parse` fallback to `normalize`, when undefined,
 *         for compatibility with redux-form.
 *    - must use Class to prevent input from loosing focus on input 'onChange'
 *
 * @param InputComponent - React component to use for input
 * @param {Function} sanitize(value, props) - callback to parse value from input Field to InputComponent
 * @returns {Class} React InputComponentField - connected to react-final-form or redux-form
 */
export function asField (InputComponent, {sanitize} = {}) {
  if (!Active.Field) Active.Field = Field
  // noinspection JSPotentiallyInvalidUsageOfThis
  const Class = class extends PureComponent {
    static propTypes = {
      name: PropTypes.string.isRequired,
      label: PropTypes.any,
      id: PropTypes.string,
      // HTML Input type attribute
      type: PropTypes.string,
      // Input placeholder
      placeholder: PropTypes.any,
      // help text or component to show on focus
      info: PropTypes.any,
      // help text or component to show on invalid input
      error: PropTypes.any,
      value: PropTypes.any,
      onChange: PropTypes.func,
      format: PropTypes.func,
      normalize: PropTypes.func,
      parse: PropTypes.func,
    }

    // Handle onRemove field in FIELD.TYPE.MULTIPLE*
    componentWillUnmount () {
      // Call onChange for the deleted input, setting it to `null`:
      // - if input is not registered, its value will not pass to backend
      //   => this should be fine, because if registeredValues are used,
      //      then backend should override the entire object (i.e. removing unregistered fields automatically).
      // - if changedValues are used, the deleted `null` value will be sent to backend,
      //      because changedValues does not depend on registered values.
      // Use setTimeout to avoid triggering `valid: false` for required fields
      // @scenario:
      //  - onChange(null) triggers `valid: false` for FIELD.TYPE.MULTIPLE with `required`, thus canSave gets disabled
      //    => to fix it, need to call onChange(null) after input unmounts, or disable validation temporarily
      //        => both cases do not update `pristine`, so cannot rely on this for `canSave` state.
      // @Note:
      //  - this.props.onChange is callback defined in withFormSetup - does not update form values, or change `pristine`
      //  - this.input.onChange is callback from final-form/redux-form - does not trigger parent re-render directly, only when `valid` prob changes
      // => the best logic is to change input value after it unmounts, and call `onChange` to update parent state,
      //    because this avoids validation, ties all operations together and persists `state.hasInputChanges`.
      const {form, name, onChange} = this.props
      setTimeout(() => {
        // only call this if the form is not unmounted
        if (!form.getRegisteredFields().length) return
        form && form.change(name, null)
        onChange && onChange(null)
      }, 0)
    }

    // do not use ...props from input, because it is shared by <Active.Field> instances
    // @Note: react-final-form fires `format()` when `input.value` getter is called
    Input = ({input: {value, ...input}, meta: {touched, error, pristine} = {}}) => {
      // Hide this field if it's readonly and has no value.
      if (this.props.readonly && isRequired(this.props.value)) return null
      const {onChange, error: errMsg, defaultValue, normalize, format, parse, validate, form, ...props} = this.props
      // @Note: defaultValue is only used for UI, internal value is still undefined
      this.value = value === '' ? (pristine && defaultValue != null ? defaultValue : value) : value
      this.input = input
      if (this.value === undefined) this.value = ''
      return (
        <InputComponent
          {...input}
          value={sanitize ? sanitize(this.value, this.props) : this.value}
          onBlur={this.handleBlur} // prevent value change, but need onBlur to set touched for validation
          onChange={this.handleChange}
          error={touched && error && (errMsg || error)}
          {...props} // allow forceful value override
        />
      )
    }

    handleBlur = () => this.input.onBlur()

    handleChange = (value) => {
      const {onChange, type, normalize, parse = normalize} = this.props
      if (type === 'number') value = value !== '' ? Number(value) : null
      // both redux-form and final-form input.onChange can accept 'event' or 'value'
      this.input.onChange(value)
      onChange && onChange(parse ? parse(value) : value)
    }

    // @Note: this is not needed as default behavior, because inputs like color always trigger onChange
    //        the logic was used for redux-form to normalize input initially
    // componentDidMount () {
    //   // Normalize initialValue
    //   const {normalize, parse = normalize, onChange} = this.props
    //   if (!parse || this.value === '') return
    //   const valueNormalized = parse(this.value)
    //   if (this.value === valueNormalized) return
    //   this.input.onChange(valueNormalized)
    //   onChange && onChange(valueNormalized)
    // }

    // Do not pass 'onChange' to Field because it fires event as argument
    // final-form does not take controlled `value`
    render () {
      const {name, disabled, normalize, format, parse = normalize, validate, options} = this.props
      return <Active.Field {...{name, disabled, normalize, format, parse, validate, options}} component={this.Input}/>
    }
  }

  Object.defineProperty(Class, 'name', {value: InputComponent.name || InputComponent.constructor.name})
  return Class
}

/**
 * React Component React Final Form Decorator with getters to detect form input changes
 * @note:
 *  - cannot wrap connected to redux component, @connect must be declared before
 * @usage:
 *  Below methods only work when using this.renderInput(FIELD.FOR.LIST),
 *  or apply <Input onChange={this.handleChangeInput.bind(this)}/> manually:
 *  - this.canSave - getter boolean: true if form has input changes, no validation error exists, and is not loading
 *  - this.changedValues - getter object: key value pairs of form input values that have changed since initial values
 *  - this.registeredValues - getter object: key value pairs of registered form input values
 *  - this.formValues - getter object: key value pairs of all form input values
 *  - this.renderInput - function: to render form inputs using FIELD.FOR.LIST definition (hooks `onChange` to inputs).
 *
 * @helpers:
 *  - this._fields - list: of FIELD.FOR.LIST hydrated with props and initialValues, ready for rendering.
 *  - this.state.hasInputChanges - boolean: true if state has form value changes (ensure handleChangeInput is called)
 *  - this.handleChangeInput() - function: updates state.hasInputChanges (hooked to this.renderInput, must be defined as function)
 *  - this.syncInputChanges() - function: can be called manually to update input changes state, and force re-rendering
 *  - this.props.onChangeState - function: callback when internal state changes, receives this class instance,
 *        or {} on unmount. This is useful for nested forms with remote submit button within parent container.
 *
 *  @example:
 *    @connect(mapStateToProps)
 *    @withForm({subscription: {pristine: true, valid: true}})
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
export function withForm (options = {subscription: {pristine: true, valid: true}}) {
  return function Decorator (Class) {
    withFormSetup(Class, {fieldValues, registeredFieldValues, registeredFieldErrors})
    let _props, _initVals

    // @see: https://final-form.org/docs/react-final-form/types/FormProps
    // Form only calls `render` function when `subscription` changes, or itself rerenders.
    // `formState` can remain unchanged, even if `initialValues` changed.
    // thus comparing formState is not suitable for memoizing when props change.
    // `formProps` does not pass through `initialValues` (it's undefined).
    // => better to let `render` function always run, and memoize at the highest <WithForm> level.
    // => this way, rerender is minimized to only when props changed, or form state changed.
    function WithForm (props) {
      console.warn('-->>WithForm-------------------------------------------')
      const {initialValues, ...restProps} = props
      _props = restProps

      // Only assign `initialValues` when it truly changes
      if (_initVals !== initialValues && !isEqualJSON(_initVals, initialValues)) _initVals = initialValues

      // @Note: when form is submitted, it triggers loading true, and receives old initialValues.
      // If the `initialValues` is computed on the fly and changes reference each time,
      // <Form/> reinitializes while loading, causing the flickering.
      // => either cache `initialValues`, or better, stop <Form/> from reinitializing while loading.
      return <Form onSubmit={warn} {...options} initialValues={_initVals} render={FormRender}/>
    }

    function FormRender (formProps) {
      console.warn('===>>>FormRender==>')
      return <Class {...formProps} {..._props} initialValues={_initVals}/>
    }

    return React.memo(WithForm, isEqualJSON)
  }
}

/**
 * Mixin to add Class Attributes and Methods commonly used with forms
 * @note: works with redux-form and react-final-form
 *
 * @param {Object} Class - React Component or PureComponent to decorate
 * @param {Function} [fieldValues] - callback to get form values
 * @param {Function} [registeredFieldValues] - callback to get form registered values
 * @param {Function} [registeredFieldErrors] - callback to get form registered errors
 * @returns {Object} Class - mutated with form properties
 */
export function withFormSetup (Class, {fieldValues, registeredFieldValues, registeredFieldErrors}) {
  if (!Active.renderField) throw new Error(`${withFormSetup.name} requires Active.renderField to be registered`)
  const componentDidUpdate = Class.prototype.componentDidUpdate
  const componentWillUnmount = Class.prototype.componentWillUnmount
  const handleChangeInput = Class.prototype.handleChangeInput

  Class.propTypes = {
    initialValues: PropTypes.object, // form initial values
    onChangeState: PropTypes.func, // onChangeState(this: Class)
    ...Class.propTypes
  }

  Class.prototype.state = {
    // This state only updates on input changes, for changes in parent props, use this.changedValues
    hasInputChanges: false, // only used to force re-render of the parent container for save button
    canSave: false, // only used internally to compare changes for re-rendering
    ...Class.prototype.state
  }

  // Define instance getter
  Object.defineProperty(Class.prototype, 'canSave', {
    get () {
      const {valid, loading} = this.props
      return valid && !loading && !!this.changedValues
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
      if (!errors) return null
      const messages = []
      // Use label if defined, for more intuitive error messages
      const fields = this._fields || []
      for (const k in errors) {
        let {label, labelGroup} = fields.find(({name}) => name === k) || {}
        label = labelGroup || label || k
        messages.push(<Text key={k} className="margin-bottom-smaller">{`• ${label}: ${toJSON(errors[k])}`}</Text>)
      }
      return <Tooltip top>
        <View className="padding-h-smaller">
          <Text className="margin-v-small bold">{_.PLEASE_COMPLETE_}</Text>
          {messages}
        </View>
      </Tooltip>
    }
  })

  // Define instance method
  Class.prototype.renderInput = function (FIELDS, {onChange, fieldsSetup} = {}) {
    const {initialValues, form} = this.props
    this._fields = fieldsFrom(FIELDS, {initialValues})
    if (fieldsSetup) this._fields = this._fields.map(fieldsSetup)
    return this._fields
      .map(({id, ...field}) => ({ // remove id just before rendering
        ...field,
        onChange: (...args) => {
          field.onChange && field.onChange(...args)
          this.handleChangeInput(...args)
          onChange && onChange(...args)
        },
        // pass `form` to each Field for custom behavior inside `asField`.
        // `form` is instance for final-form, and string for redux-form.
        form,
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

  return Class
}
