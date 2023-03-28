import { UI } from 'ui-modules-pack/variables'
import { fieldsFrom } from 'ui-modules-pack/variables/fields'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Field, Form } from 'react-final-form'
import { tooltipProps } from 'ui-react-pack'
import { isRequired } from 'ui-react-pack/inputs/validationRules'
import Text from 'ui-react-pack/Text'
import ToolTip from 'ui-react-pack/Tooltip'
import TooltipPop from 'ui-react-pack/TooltipPop'
import View from 'ui-react-pack/View'
import { Active, debounce, isEqualJSON, toJSON, warn } from 'ui-utils-pack'
import { hasObjectValue, objChanges, set } from 'ui-utils-pack/object'
import { _ } from 'ui-utils-pack/translations'
import { clearErrorsMap, errorsProcessing } from 'core/src/pages/eis/utils'
import { formsStorage } from 'core/src/pages/eis/rules'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

let isDataChangedListenerCalled = false;

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
 * @returns {Object|Undefined} values - nested mapping of field values by their name, or `false` if no field values found
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
  if (hasObjectValue(values)) return values
}

/**
 * Get Form's Registered Field Errors
 *
 * @param {FormApi} form - instance from react-final-form
 * @returns {Object|Undefined} errors - key values of field names and error messages
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
  if (hasObjectValue(errors)) return errors
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
 * @param {Function} sanitize(value, props) - callback to parse (formatted) value from input Field to InputComponent
 * @returns {Class} React InputComponentField - connected to react-final-form or redux-form
 */
export function asField (InputComponent, {sanitize} = {}) {
  if (!Active.Field) Active.Field = Field
  // noinspection JSPotentiallyInvalidUsageOfThis
  const Class = class extends PureComponent {
    static propTypes = {
      // Input `name` attribute
      name: PropTypes.string.isRequired,
      // Instance of the Class component decorated withFormSetup (i.e withForm)
      instance: PropTypes.object,
      // Whether to fire Field.onChange(null) when its component unmounts
      onRemoveChange: PropTypes.bool,
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
      translate: PropTypes.func,
    }

    get value () {
      if (this._value !== void 0) return this._value
      return ''
    }

    set value (v) {
      this._value = v
    }

    componentDidMount () {
      this.didMount = true
    }

    // Handle onRemove field in FIELD.TYPE.MULTIPLE*
    componentWillUnmount () {
      // warn('-------componentWillUnmount', this.constructor.name)
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
      //    because this avoids validation, ties all operations together and persists `state.canSave`.
      const {instance, name, onChange, onRemoveChange} = this.props
      if (instance && onRemoveChange) {
        const initialValues = this.initValues
        setTimeout(() => {
          // only call this if the form is not unmounted and initialValues remained (i.e. not between transitions)
          if (instance.isUnmounting) return
          const form = instance.form
          if (form && initialValues === instance.props.initialValues) {
            form.change(name, null)
            onChange && onChange(null) // update Save button state
          }
        }, 0)
      }
    }

    // do not use ...props from input, because it is shared by <Active.Field> instances
    // @Note: react-final-form fires `format()` when `input.value` getter is called
    Input = ({input: {value, ...input}, meta: {touched, error, pristine} = {}}) => {
      const {
        onChange, error: err, defaultValue, normalize, format, parse, validate,
        instance, onRemoveChange, ...props
      } = this.props

      if (!this.hasFocus) { // use cached `value` while editing to prevent format/parse bugs and rerender
        // @Note: defaultValue is only used for UI, internal value is still undefined
        this.value = value === void 0 ? (pristine && defaultValue != null ? (format ? format(defaultValue) : defaultValue) : value) : value
      }

      // Hide this field if it's readonly and has no value.
      if (this.props.readonly && isRequired(this.value != null ? this.value : this.props.value)) return null

      this.input = input

      if (instance) this.initValues = instance.props.initialValues

      return (
        <InputComponent
          {...input}
          value={sanitize ? sanitize(this.value, this.props) : this.value}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur} // prevent value change, but need onBlur to set touched for validation
          onChange={this.handleChange}
          error={error && (touched || !pristine) && (err || error)} // only show error after user interaction
          {...props} // allow forceful value override
        />
      )
    }

    handleFocus = (...args) => {
      this.hasFocus = true
      return this.input.onFocus(...args)
    }

    handleBlur = () => {
      this.hasFocus = false
      return this.input.onBlur()
    }

    handleChange = (value, ...args) => {
      const {onChange, type, normalize, parse = normalize} = this.props
      /**
       * @Note:
       *  - `parse` gets called by final-form automatically on input.onChange,
       *    but `formatOnBlur` (needed to prevent cursor jumping) only calls format onBlur,
       *    even if input did not change. This causes extra call on `format` when input did not change,
       *    and doesn't call `format` when `parse` was called onChange.
       *    => the solution is to cache `value` internally to prevent Input rerender while in focus,
       *      and remove `formatOnBlur` because it's buggy behavior (does not format on initial mount).
       */
      if (this.hasFocus) {
        this.value = value // store value exactly as typed in (example: value of '1.0' to work nicely with `unit` = '%')
      }
      if (type === 'number') value = value !== '' ? Number(value) : null
      this.input.onChange(value) // both redux-form and final-form input.onChange can accept 'event' or 'value'
      onChange && onChange(parse ? parse(value) : value, ...args)
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
      const {
        name, disabled, normalize, format, parse = normalize, validate, options
      } = this.props
      return <Active.Field {...{name, disabled, normalize, format, parse, validate, options}}
                           component={this.Input}/>
    }
  }

  Object.defineProperty(Class, 'name', {value: InputComponent.name || InputComponent.constructor.name})
  return Class
}

/**
 * React Component React Final Form Decorator with getters to detect form input changes
 * @note:
 *  - cannot wrap connected to redux component, @connect must be declared before
 *  - onSubmit can be passed to the decorated Class component
 * @example:
 *     *@withForm()
 *      class SigninForm extends PureComponent {}
 *      // later in the render()
 *      <SigninForm onSubmit={(formValues, form, callback: ?(errors?) => void) => ?Object | Promise<?Object> | void}/>
 *      // see https://final-form.org/docs/react-final-form/types/FormProps#onsubmit
 *
 * @usage:
 *  Below methods only work when using this.renderInput(FIELD.FOR.LIST),
 *  or apply <Input onChange={this.handleChangeInput.bind(this)}/> manually:
 *  - this.canSave - getter boolean: true if form has input changes, no validation error exists, and is not loading
 *  - this.changedValues - getter object: key value pairs of form input values that have changed since initial values
 *  - this.registeredValues - getter object: key value pairs of registered form input values
 *  - this.changedAndRegisteredValues - getter object: combination of above
 *  - this.formValues - getter object: key value pairs of all form input values
 *  - this.renderInput - function: to render form inputs using FIELD.FOR.LIST definition (hooks `onChange` to inputs).
 *
 * @helpers:
 *  - this._fields - list: of FIELD.FOR.LIST hydrated with props and initialValues, ready for rendering.
 *  - this.handleChangeInput() - function: updates state.canSave (hooked to this.renderInput, must be defined as function)
 *  - this.syncInputChanges() - function: can be called manually to update input changes state, and force re-rendering
 *  - this.props.tooltip - object|boolean: automatically wrap rendered input with Semantic UI Popup
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
 * @param {Component} [Tooltip] - React component to wrap inputs with tooltip
 * @returns {Function} decorator - HOC wrapper function for given React component
 */
export function withForm (options = {subscription: {pristine: true, valid: true}}, Tooltip = TooltipPop) {
  return function Decorator (Class) {
    // @Note: form field re-renders because of constantly changing formProps reference
    //        => convert it to instance getter, so `asField` does not depend on formProps.
    //        => cannot use context, because it triggers re-render of all child components.
    // Define withFormSetup here to load it only once on App init
    withFormSetup(Class, {fieldValues, registeredFieldValues, registeredFieldErrors, Tooltip})

    // @Note: to avoid several WithForm instances sharing the same closure props,
    //        this decorator must return a class component that stores its internal state between re-renders.
    // Use PureComponent to avoid double checking large payloads.
    // noinspection JSPotentiallyInvalidUsageOfThis
    return class WithForm extends PureComponent {
      get initValues () {
        return this._initValues || (this._initValues = this.props.initialValues)
      }

      prevInitialValues = null;

      // @see: https://final-form.org/docs/react-final-form/types/FormProps
      // Form only calls `render` function when `subscription` changes, or itself rerenders.
      // `formState` can remain unchanged, even if `initialValues` changed.
      // thus comparing formState is not suitable for memoizing when props change.
      // `formProps` does not pass through `initialValues` (it's undefined).
      // => better to let `render` function always run, and memoize at the highest <WithForm> level.
      // => this way, rerender is minimized to only when props changed, or form state changed.
      renderForm = ({form, handleSubmit, ...formProps}) => {
        // warn('-->>renderForm-----------------')
        // formProps `form` and `handleSubmit` props always change, possibly due to inline fat arrow function.
        this.form = form
        this.handleSubmit = handleSubmit
        if (!isEqualJSON(this._formProps, formProps)) this._formProps = formProps

        // Class should use PureComponent to take advantage of caching
        return <Class {...this._props} formProps={this._formProps} initialValues={this._initValues} instance={this}/>
      }

      componentDidMount () {
        const { meta, initialValues } = this.props
        this.prevInitialValues = {...initialValues}
        formsStorage.set(this.prevInitialValues, {
          meta: meta,
          form: this.form
        });
      }

      UNSAFE_componentWillReceiveProps (next, nextContext) {
        const {initialValues, meta} = next
        // Only assign `initialValues` when it truly changes
        if (this._initValues !== initialValues && !isEqualJSON(this._initValues, initialValues)) {
          formsStorage.delete(this.prevInitialValues)
          this._initValues = initialValues
          this.prevInitialValues = {...initialValues}
          // explicitly reset to new values when entries change,
          // because final-form only resets to the very first initialValues.
          if (this.form) {
            this.form.reset(this._initValues)
            formsStorage.set(this.prevInitialValues, {
              meta: meta,
              form: this.form
            });
          }
        }
      }

      componentWillUnmount () {
        formsStorage.delete(this.prevInitialValues)
      }

      render () {
        // warn('-->>WithForm-------------------------------------------')
        const {initialValues, onSubmit = warn, ...restProps} = this.props
        this._props = restProps

        // @Note: when form is submitted, it triggers loading true, and receives old initialValues.
        // If the `initialValues` is computed on the fly and changes reference each time,
        // <Form/> reinitialises while loading, causing the flickering.
        // => either cache `initialValues`, or better, stop <Form/> from reinitializing while loading.
        //    because final-form always re-initializes, there is no `enableReinitialize` like redux-form.
        return <Form onSubmit={onSubmit} {...options} initialValues={this.initValues} render={this.renderForm}/>
      }
    }
  }
}

/**
 * Mixin to add Class Attributes and Methods commonly used with forms
 * @note: works with react-final-form, redux-form requires update with parent `instance` for `this.form` to work
 *
 * @param {Object} Class - React Component or PureComponent to decorate
 * @param {Function} fieldValues - callback to get form values
 * @param {Function} registeredFieldValues - callback to get form registered values
 * @param {Function} registeredFieldErrors - callback to get form registered errors
 * @param {Component} [Tooltip] - React component to wrap inputs with tooltip
 * @returns {Object} Class - mutated with form properties
 */
export function withFormSetup (Class, {fieldValues, registeredFieldValues, registeredFieldErrors, Tooltip}) {
  if (!Active.renderField) throw new Error(`${withFormSetup.name} requires Active.renderField to be registered`)
  const UNSAFE_componentWillReceiveProps = Class.prototype.UNSAFE_componentWillReceiveProps
  const componentWillUnmount = Class.prototype.componentWillUnmount
  const handleChangeInput = Class.prototype.handleChangeInput

  Class.propTypes = {
    formProps: PropTypes.object.isRequired, // form props, without `form` and `handleSubmit`
    instance: PropTypes.object.isRequired, // {Class<form, handleSubmit>} WithForm instance for getting the form
    initialValues: PropTypes.object, // form initial values
    onChangeState: PropTypes.func, // onChangeState(this: Class)
    ...Class.propTypes
  }

  Class.prototype.state = {
    // This state only updates on input changes, for changes in parent props, use this.changedValues
    canSave: false, // used to compare changes for re-rendering, like 'Save' button
    ...Class.prototype.state
  }

  // Define instance getter
  Object.defineProperty(Class.prototype, 'form', {
    get () {return this.props.instance.form}
  })

  // Define instance getter
  Object.defineProperty(Class.prototype, 'handleSubmit', {
    get () {return this.props.instance.handleSubmit}
  })

  // Define instance getter
  Object.defineProperty(Class.prototype, 'canSave', {
    get () {
      // @note: do not use `pristine` because it only reflects visible (i.e. registered inputs)
      //        do not use `valid` because it does not compute correctly on tab changes in FieldsInGroup
      const {loading} = this._props || this.props
      return !loading && !registeredFieldErrors(this.form) && !!this.changedValues
    }
  })

  // Define instance getter
  Object.defineProperty(Class.prototype, 'formValues', {
    get () {
      return fieldValues(this.form)
    }
  })

  // Define instance getter
  Object.defineProperty(Class.prototype, 'registeredValues', {
    get () {
      return registeredFieldValues(this.form)
    }
  })

  // Define instance getter
  Object.defineProperty(Class.prototype, 'changedValues', {
    get () {
      // Have to select all form values, because registered values may not include all input values
      const {initialValues} = this._props || this.props
      return objChanges(initialValues, this.formValues)
    }
  })

  // Define instance getter
  Object.defineProperty(Class.prototype, 'changedAndRegisteredValues', {
    get () {
      const values = Object.assign({}, this.registeredValues || {}, this.changedValues || {})
      if (hasObjectValue(values)) return values
    }
  })

  // Define instance getter
  Object.defineProperty(Class.prototype, 'validationErrors', {
    get () {
      const errors = registeredFieldErrors(this.form)
      if (!errors) return null
      const messages = []
      // Use label if defined, for more intuitive error messages
      const fields = this._fields || []
      for (const k in errors) {
        let {label, labelGroup} = fields.find(({name}) => name === k) || {}
        label = labelGroup || label || k
        messages.push(<Text key={k} className="margin-bottom-smaller">{`• ${label}: ${toJSON(errors[k])}`}</Text>)
      }
      return (
        <View className="padding-h-smaller">
          <Text className="margin-v-small bold">{_.PLEASE_COMPLETE_}</Text>
          {messages}
        </View>
      )
    }
  })

  Object.defineProperty(Class.prototype, 'validationErrorsTooltip', {
    get () {
      const errors = this.validationErrors
      return errors ? <ToolTip top>{errors}</ToolTip> : null
    }
  })

  // Define instance method
  Class.prototype.renderInput = function (FIELDS, {onChange, fieldsSetup} = {}) {
    const {initialValues} = this.props
    this._fields = fieldsFrom(FIELDS, {initialValues})
    if (fieldsSetup) this._fields = this._fields.map(fieldsSetup)
    return this._fields
      .map(({id, onRenderProps, ...field}, i) => ({ // convert id to key just before rendering, to prevent unmounts on form.reset()
        key: `${id}_${field.name || i}`,
        ...field,
        ...onRenderProps && onRenderProps(this, initialValues),
        onChange: (...args) => {
          field.onChange && field.onChange(...args, this)
          this.handleChangeInput(...args)
          onChange && onChange(...args)
        },
        instance: this,
      }))
      .map(({tooltip, ...field}) => {
        const result = Active.renderField(field)
        // Wrap component with Tooltip automatically
        if (tooltip != null)
          return <Tooltip key={field.key} {...tooltipProps(tooltip)}>{result}</Tooltip>
        return result
      })
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
    const { formProps, onDataChanged, parent = {} } = this._props || this.props;
    if (!formProps.pristine || isDataChangedListenerCalled) {
      isDataChangedListenerCalled = true
      if (typeof onDataChanged === 'function') {
        onDataChanged()
      } else if (parent && typeof parent.onDataChanged === 'function') {
        parent.onDataChanged();
      }
    }

    const canSave = this.canSave
    if (canSave !== this.state.canSave) {
      this.setState({canSave})
      const {onChangeState} = this._props || this.props
      if (onChangeState) onChangeState(this)
    }
  }

  Class.prototype.UNSAFE_componentWillReceiveProps = function (next) {
    // @Note: using componentDidUpdate comparison logic is not reliable,
    // because on the last re-render, Form may trigger `pristine` update without changing initialValues,
    // which will make .canSave false, but this.syncInputChanges() only updated in the previous render, which was true.
    // => thus need to take formProps into consideration
    if (
      !isEqualJSON(next.initialValues, this.props.initialValues) ||
      !isEqualJSON(next.formProps, this.props.formProps)
    ) {
      // temporarily set to next props for state computation
      this._props = next
      this.syncInputChanges()
      this._props = null
      if (this._meta) {
        errorsProcessing(this.form, this._meta);
      }
    }
    if (UNSAFE_componentWillReceiveProps) UNSAFE_componentWillReceiveProps.apply(this, arguments)
  }

  Class.prototype.componentWillUnmount = function () {
    if (this._meta) {
      clearErrorsMap(this.form, this._meta)
    }

    this.isUnmounting = true
    if (this.props.onChangeState) this.props.onChangeState({})
    if (componentWillUnmount) componentWillUnmount.apply(this, arguments)
  }

  return Class
}

/**
 * React Component Group Input Change Decorator to fire onChange callback as group of fields together
 *
 * @usage:
 *  - provides this.fields prop that is automatically hooked with `onChange` to fire callback as group of inputs
 *
 * @example:
 *    @withGroupInputChange
 *    class Fields extends Component {
 *      render () {
 *        return this.fields.map(renderField)
 *      }
 *    }
 *
 * @param {Object} constructor - class
 */
export function withGroupInputChange (constructor) {
  const componentDidMount = constructor.prototype.componentDidMount

  constructor.propTypes = {
    name: PropTypes.string, // top level field prefix
    items: PropTypes.array.isRequired, // list of fields attributes to render
    instance: PropTypes.object.isRequired, // Instance of the Class component decorated withFormSetup (i.e withForm)
    initialValues: PropTypes.object, // input default values, required for `onChange` callback to work properly
    onChange: PropTypes.func, // callback, receiving all nested field value changes combined, grouped by input name
    required: PropTypes.bool, // input prop
    disabled: PropTypes.bool, // input prop
    ...constructor.propTypes,
  }

  // Define instance getter
  Object.defineProperty(constructor.prototype, 'fields', {
    get () {
      // Hook to `onChange` call from each field in the group
      const {items, name: prefix, instance} = this.props
      return items.map(({name, onChange, ...field}) => ({
        name: prefix ? (prefix + '.' + name) : name,
        onChange: (val, ...args) => {
          onChange && onChange(val, ...args)
          this.handleChangeInput(name, val)
        },
        ...field,
        instance,
      }))
    }
  })

  constructor.prototype.handleChangeInput = function (name, value) {
    const {onChange} = this.props
    if (!onChange) return
    this.values = {...this.values, [name]: value}
    onChange(this.values)
  }

  constructor.prototype.componentDidMount = function () {
    const {onChange, initialValues, name} = this.props
    if (name && onChange && initialValues === undefined)
      warn(this.constructor.name, `.${name} requires 'initialValues', if 'onChange(values)' is used`)
    // Oly pre-populate group values if initialValues was subset of the entire form, so changes can be submitted together
    if (initialValues && name) this.values = {...initialValues}
    if (componentDidMount) componentDidMount.apply(this, arguments)
  }

  return constructor
}

/**
 * Compose Validators Array into a Single Validator Function
 * @param {Function[]|function(any)} validators - to compose
 * @returns {Function} validator for use with react-final-form
 */
export function composeValidators (...validators) {
  return (value) => validators.reduce((error, validator) => error || validator(value), undefined)
}
