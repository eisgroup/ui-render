import { UI } from '../variables'
import React, { PureComponent, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Field, Form } from 'react-final-form'
import type { FieldRenderProps, FormProps, FormRenderProps } from 'react-final-form'
import type { FormApi, FormState, MutableState } from 'final-form'
import { isRequired } from '../../components/inputs/validationRules'
import Text from '../../components/Text'
import ToolTip from '../../components/Tooltip'
import View from '../../components/View'
import { Active, debounce, isEqualJSON, toJSON } from '../../utils'
import type { Debounced } from '../../utils/function'
import { hasObjectValue, objChanges, set } from '../../utils/object'
import { _ } from '../../utils/translations'
import { baselineOf, clearErrorsFor, clearTouchedFor, formsStorage, hasBaseline, setBaseline, touchedFor } from '../../state/formRegistry'
import arrayMutators from 'final-form-arrays'

/** A form's values, as final-form holds them. */
type Values = Record<string, any>

/** What final-form hands a field's input: its `input` props, without `value`, which the field caches. */
type FieldInput = Omit<FieldRenderProps<unknown>['input'], 'value'>

/** A value transform a field hands final-form. */
type ValueTransform = (value: unknown) => unknown

/**
 * The document a field or form belongs to. `any`, deliberately: it is the engine's class with the form
 * layer over it, whose members are added by the classes in `rules` and here rather than declared once.
 */
type DocumentInstance = any

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

// `formInitialValues` and `storedTouched` used to be module-level here. Both are per FORM since
// §9.3 step 3 and live in `state/formRegistry`, which the engine imports too — see the note there
// for why they had to move together.

/**
 * Get Form's Field Values
 * @param {Object} form - instance from react-final-form
 * @return {Object} formValues - key values of field names and values
 */
export function fieldValues (form: FormApi): Values {
  return form.getState().values
}

/**
 * Get Form's Registered Field Values
 *
 * @param {FormApi} form - instance from react-final-form
 * @returns {Object|Undefined} values - nested mapping of field values by their name, or `false` if no field values found
 */
export function registeredFieldValues (form: FormApi): Values | undefined {
  const registeredFieldNames = form.getRegisteredFields()
  if (!registeredFieldNames.length) return

  // Return object mapping of registered values,
  // unfilled fields are considered as non-registered.
  const values: Values = {}
  registeredFieldNames.forEach(field => {
    // Not undefined: the field was just listed as registered.
    const {value} = form.getFieldState(field)!
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
export function registeredFieldErrors (form: FormApi): Record<string, unknown> | undefined {
  const registeredFieldNames = form.getRegisteredFields()
  if (!registeredFieldNames.length) return

  // Return object mapping of registered field errors,
  // unfilled fields are considered as non-registered.
  const errors: Record<string, unknown> = {}
  registeredFieldNames.forEach(field => {
    // Not undefined: the field was just listed as registered.
    const {error} = form.getFieldState(field)!
    if (error != null) errors[field] = error
  })
  if (hasObjectValue(errors)) return errors
}

/**
 * HELPER FUNCTIONS ============================================================
 * =============================================================================
 */

/**
 * Wrapper Proxy for react-final-form Field with unified API.
 * @Note:
 *    - `normalize` does not exist in react-final-form, only `format` and `parse`
 *    - must use Class to prevent input from loosing focus on input 'onChange'
 *
 * @param InputComponent - React component to use for input
 * @param {Object} [options]
 * @param {function(*, *): *} [options.sanitize] - `(value, props)`: parses the (formatted) value from input Field to InputComponent
 * @returns {import('react').ComponentClass<*>} React InputComponentField - connected to react-final-form
 */
/** The props a field reads; the rest are passed to the input it renders. */
export type AsFieldProps = {
  /** Input `name` attribute */
  name: string
  /**
   * The document the field belongs to, the class decorated withFormSetup (i.e withForm): its form,
   * its initial values, and whether it is unmounting
   */
  instance?: DocumentInstance
  /** Whether to fire Field.onChange(null) when its component unmounts */
  onRemoveChange?: boolean
  defaultValue?: unknown
  value?: unknown
  readonly?: boolean
  disabled?: boolean
  /** Help text or component to show on invalid input */
  error?: React.ReactNode
  onChange?: (value: unknown, ...args: unknown[]) => void
  format?: ValueTransform
  normalize?: ValueTransform
  parse?: ValueTransform
  validate?: (value: unknown, allValues: object) => unknown
  options?: unknown
  /**
   * Everything else reaches the input: `label`, `id`, `type` (the HTML attribute), `placeholder`,
   * `info` (help text or component to show on focus), `translate`
   */
  [key: string]: unknown
}

/**
 * @param InputComponent - `any` props: the field spreads final-form's input and its own props onto it,
 *    which only the input's own type describes.
 */
export function asField (InputComponent: React.ComponentType<any>, {sanitize}: { sanitize?: (value: unknown, props: AsFieldProps) => unknown } = {}) {
  if (!Active.Field) Active.Field = Field
  // noinspection JSPotentiallyInvalidUsageOfThis
  const Class = class extends PureComponent<AsFieldProps> {
    // The last value seen before an empty one normalized to `undefined`, kept only to make that
    // transition a one-shot. NOT React state: nothing renders from it, so holding it in state only
    // scheduled an update from inside `Input` — a second render pass per Dropdown field and React's
    // "Cannot update during an existing state transition" warning.
    selectPreviousValue: unknown = null

    _value: unknown
    hasFocus?: boolean
    input!: FieldInput
    initValues: unknown

    get value () {
      if (this._value !== void 0) {
        return this._value
      }
      return ''
    }

    set value (v: unknown) {
      this._value = v
    }

    // Handle onRemove field in the repeated-field views (what FIELD.TYPE.MULTIPLE/MULTIPLE_LEVEL
    // used to name — those constants were deleted 2026-09-22 as unreachable, but this unmount
    // path is live and is reached by any field the host removes from a repeated group)
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
      //  - onChange(null) triggers `valid: false` for a required field in a repeated group, thus canSave gets disabled
      //    => to fix it, need to call onChange(null) after input unmounts, or disable validation temporarily
      //        => both cases do not update `pristine`, so cannot rely on this for `canSave` state.
      // @Note:
      //  - this.props.onChange is callback defined in withFormSetup - does not update form values, or change `pristine`
      //  - this.input.onChange is callback from final-form - does not trigger parent re-render directly, only when `valid` prob changes
      // => the best logic is to change input value after it unmounts, and call `onChange` to update parent state,
      //    because this avoids validation, ties all operations together and persists `state.canSave`.
      const {instance, name, onChange, onRemoveChange} = this.props
      if (instance && onRemoveChange) {
        const initialValues = this.initValues
        setTimeout(() => {
          // only call this if the form is not unmounted and initialValues remained (i.e. not between transitions)
          if (instance.isUnmounting) {
            return
          }
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
    Input = ({input: {value, ...input}, meta: {touched, error, pristine} = {}}: FieldRenderProps<unknown>) => {
      const {
        onChange, error: err, defaultValue, normalize, format, parse, validate,
        instance, onRemoveChange, ...props
      }: AsFieldProps = this.props

      if (!this.hasFocus) { // use cached `value` while editing to prevent format/parse bugs and rerender
        // @Note: defaultValue is only used for UI, internal value is still undefined
        this.value = value === void 0
          ? (pristine && defaultValue != null ? (format ? format(defaultValue) : defaultValue) : value)
          : value

      }

      // Hide this field if it's readonly and has no value.
      if (this.props.readonly && isRequired(this.value != null ? this.value : this.props.value)) return null

      this.input = input

      if (instance) this.initValues = instance.props.initialValues

      const nextValue = (InputComponent.displayName) === 'Dropdown'
        ? (value === '' ? undefined : value)
        : sanitize
          ? sanitize(this.value, this.props)
          : this.value

      if ((InputComponent.displayName) === 'Dropdown') {
        if (nextValue === value) {
          this.selectPreviousValue = nextValue
        } else if (nextValue !== value && this.selectPreviousValue !== null) {
          props.value = nextValue
          this.selectPreviousValue = null
        }

      }

      // A field reaches its form through the instance the engine gives every field
      // (`mapper.tsx` passes `instance` on every `renderField` call). A field rendered without one
      // is not part of a document and has no remembered touches to consult.
      const rememberedTouched = instance && instance.form ? touchedFor(instance.form) : {}
      const errorText = error && (rememberedTouched[input.name] || touched || !pristine) && (err || error)

      return (
        <InputComponent
          {...input}
          value={nextValue}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur} // prevent value change, but need onBlur to set touched for validation
          onChange={this.handleChange}
          error={errorText} // only show error after user interaction
          {...props} // allow forceful value override
        />
      )
    }

    handleFocus = (...args: Parameters<FieldInput['onFocus']>) => {
      this.hasFocus = true
      return this.input.onFocus(...args)
    }

    handleBlur = () => {
      this.hasFocus = false
      return this.input.onBlur()
    }

    handleChange = (value: unknown, ...args: unknown[]) => {
      const {onChange, normalize, parse = normalize, instance} = this.props
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
      const parsedValue = parse ? parse(value) : value
      // Use form.change with current field name instead of this.input.onChange to avoid
      // stale closure in react-final-form's useConstantCallback. When a parent Select
      // changes and child field names update, React effects fire bottom-up (child before
      // parent), so this.input.onChange may still reference the old field registration,
      // writing the value to the wrong path and causing data corruption.
      if (instance && instance.form) {
        instance.form.change(this.input.name, parsedValue)
      } else {
        this.input.onChange(parsedValue) // fallback for fields without UIRender instance
      }
      onChange && onChange(parsedValue, ...args)
    }

    // Do not pass 'onChange' to Field because it fires event as argument
    // final-form does not take controlled `value`
    render () {
      const {
        name, disabled, normalize, format, parse = normalize, validate, options
      } = this.props
      // A cast, not a guard, read at render: final-form's `Field`, unless something replaced it.
      const ActiveField = Active.Field as typeof Field
      return <ActiveField {...{name, disabled, normalize, format, parse, validate, options}}
                           component={this.Input}/>
    }
  }

  Object.defineProperty(Class, 'name', {value: (InputComponent.name || InputComponent.constructor.name) + 'AsField'})
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
 *  or apply <Input onChange={this.handleChangeInput.bind(this)}/> manually:
 *  - this.canSave - getter boolean: true if form has input changes, no validation error exists, and is not loading
 *  - this.changedValues - getter object: key value pairs of form input values that have changed since initial values
 *  - this.registeredValues - getter object: key value pairs of registered form input values
 *  - this.changedAndRegisteredValues - getter object: combination of above
 *  - this.formValues - getter object: key value pairs of all form input values
 *
 * @helpers:
 *  - this.handleChangeInput() - function: updates state.canSave (hooked to this.renderInput, must be defined as function)
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
/** The `<Form>` options a document is wrapped with, and the two the wrapper reads itself. */
export type WithFormOptions = Partial<FormProps<Values>> & {
  /** Turns the class with the form layer over it into the component the wrapper renders */
  host?: (Class: any) => React.ComponentType<any>
  /** The engine's error pass, handed in rather than imported (see below); `meta` is the engine's node */
  processErrors?: (form: FormApi, meta: any) => void
}

/** What the document is handed as `instance`: the form, and its submit handler, as the form renders. */
type FormHandle = { form?: FormApi, handleSubmit?: FormRenderProps<Values>['handleSubmit'] }

export function withForm (options: WithFormOptions = {subscription: {pristine: true, valid: true}}) {
  // The engine's error processing arrives as a CALLBACK rather than an import (§9.3 step 2). It reads
  // a meta node and writes the shared error map, which is engine business; importing it from here was
  // half of the `engine` <-> `modules/form` cycle, and moving it down would have put engine logic
  // below the layer that uses it. The registries both sides write to did move — to `state/formRegistry`.
  // It is optional: `withFormSetup` is exported and called directly by tests that never process errors.
  //
  // `host`, also optional, is what turns the class with the form layer over it into the component the
  // wrapper renders. The engine passes its document host (§9.3 step 6): its layers are the classes of
  // an instance, not React components. Without one, the class is rendered as the component it is.
  // It is not a `<Form>` option, so it is kept out of the ones the wrapper hands the form.
  const {host, ...formOptions} = options
  const {processErrors} = formOptions
  return function Decorator (Class: any) {
    // @Note: form field re-renders because of constantly changing formProps reference
    //        => convert it to instance getter, so `asField` does not depend on formProps.
    //        => cannot use context, because it triggers re-render of all child components.
    // Built here, once per decorated class, and it is what the wrapper below renders: `Class` with the
    // form layer over it, since `withFormSetup` no longer writes onto `Class` itself.
    const FormClass = withFormSetup(Class, {fieldValues, registeredFieldValues, registeredFieldErrors, processErrors})
    // A cast, not a guard: without a host, the class is the React component the class it builds on
    // is. It is declared over an untyped base, so the checker cannot see that for itself.
    const FormComponent = host ? host(FormClass) : (FormClass as unknown as React.ComponentType<any>)

    const formSubscription = (form: FormApi) => ({touched, initialValues}: FormState<Values>) => {
      // Everything below is about THIS form. It used to compare against one module-level baseline,
      // so a second document mounting reset the first one's touched fields and errors.
      if (!hasBaseline(form)) {
        setBaseline(form, initialValues);
      }

      if (baselineOf(form) !== initialValues && initialValues && Object.keys(initialValues).length) {
        setBaseline(form, initialValues);
        for(const field of Object.keys(touchedFor(form))){
          form.mutators.setFieldTouched(field, false)
        }
        clearTouchedFor(form)
        clearErrorsFor(form)
      } else {
        // Not undefined: the subscription below asks for `touched`.
        for(const field of Object.keys(touched!)) {
          if(touched![field]) {
            touchedFor(form)[field] = true;
          }
        }
      }
    }

    /**
     * THE WRAPPER, A FUNCTION SINCE §9.3 STEP 6 (slice 5). It was a `PureComponent`; `React.memo`
     * skips a parent's render with shallow-equal props the same way.
     *
     * The document is handed `instance`, one object for the wrapper's lifetime, and reads `form` and
     * `handleSubmit` off it. Both are written as the form renders, as the class wrote them on `this`.
     * `form` is the first object react-final-form handed its render prop for the final-form instance it
     * renders: it hands a new `{...form, reset}` on every render, and every one of them shares the
     * instance's methods (see `renderForm`).
     */
    function WithForm (props: { initialValues?: Values, onSubmit?: FormProps<Values>['onSubmit'], [key: string]: unknown }) {
      const {initialValues, onSubmit = console.warn, ...restProps} = props
      const self = useRef<{
        handle: FormHandle
        form?: FormApi
        formProps?: unknown
        subscribedForm?: FormApi | null
        unsubscribe?: (() => void) | null
        stored?: object
      } | null>(null)
      if (self.current === null) self.current = {handle: {form: undefined, handleSubmit: undefined}}
      const own = self.current
      const {handle} = own

      // The initial values the form works from: the first ones, then any that differ BY VALUE. A new
      // object with the same entries changes nothing; otherwise a host computing its values afresh
      // would reset the user's edits. Adopted during render, where `componentWillReceiveProps` did it.
      const [adopted, setAdopted] = useState(initialValues)
      if (adopted !== initialValues && !isEqualJSON(adopted, initialValues)) setAdopted(initialValues)
      // What the document is told the form started from: the adopted values once the form has been
      // reset to them, below. Told any earlier, it would compare them with the old form state and
      // publish a `canSave` it takes back one render later.
      const [applied, setApplied] = useState(adopted)

      // One subscription at a time, to the form the wrapper keeps (`renderForm`).
      const subscribeTo = (form: FormApi) => {
        if (own.unsubscribe) own.unsubscribe()
        own.subscribedForm = form
        own.unsubscribe = form.subscribe(
          formSubscription(form),
          {touched: true, initialValues: true, error: true, errors: true}
        )
      }

      // @see: https://final-form.org/docs/react-final-form/types/FormProps
      // Form only calls `render` function when `subscription` changes, or itself rerenders.
      // `formState` can remain unchanged, even if `initialValues` changed.
      // thus comparing formState is not suitable for memoizing when props change.
      // `formProps` does not pass through `initialValues` (it's undefined).
      // => better to let `render` function always run, and memoize at the highest <WithForm> level.
      // => this way, rerender is minimized to only when props changed, or form state changed.
      const renderForm = ({form: rendered, handleSubmit, ...formProps}: FormRenderProps<Values>) => {
        // ONE form object per final-form instance: the first one react-final-form hands over. It hands a
        // NEW `{...form, reset}` on every render, and the registries in `state/formRegistry` are keyed by
        // the object. Keyed per render, each render started them empty: a field's remembered touch, the
        // reason that registry exists, was gone by the next render, so a touched field remounted by a tab
        // switch lost its error. Every one of those objects shares the instance's methods, and the `reset`
        // each adds resets that same instance. The instance is told apart by those methods, not kept as
        // the first object seen: StrictMode's discarded first render builds an instance of its own, and
        // the committed instance's object must replace it.
        if (!own.form || own.form.getState !== rendered.getState) own.form = rendered
        const form = own.form
        handle.form = form
        handle.handleSubmit = handleSubmit

        if (!isEqualJSON(own.formProps, formProps)) {
          own.formProps = formProps
        }

        if (own.subscribedForm !== form) subscribeTo(form)

        // Class should use PureComponent to take advantage of caching
        return <FormComponent {...restProps} formProps={own.formProps} initialValues={applied} instance={handle}/>
      }

      // In the shared storage under a copy of the values it started with, from the commit it mounts in
      // until it unmounts.
      useBeforePaintEffect(() => {
        // StrictMode runs a mount's effects twice, and the cleanup below has just unsubscribed: subscribe
        // again, to the form the last render subscribed to. On a mount, that render's subscription is
        // still there (§9.3 step 7).
        if (!own.subscribedForm && handle.form) subscribeTo(handle.form)
        own.stored = {...initialValues}
        formsStorage.set(own.stored, {
          meta: props.meta,
          // Not undefined: the form rendered, and handed it over, before any effect runs.
          form: handle.form!
        });
        return () => {
          if (own.unsubscribe) own.unsubscribe()
          own.unsubscribe = null
          own.subscribedForm = null
          formsStorage.delete(own.stored!) // not undefined: the mount above stored it
        }
      }, []) // eslint-disable-line react-hooks/exhaustive-deps -- the mount's values, as `componentDidMount` read them

      // New initial values: reset the form to them, because final-form only resets to the very first
      // ones, move the storage entry, and tell the document. `componentWillReceiveProps` reset before
      // the render; this is after the commit, and before the paint. So the document renders twice for
      // new initial values, once for the props and once for the reset, where the class rendered it
      // once on React 16 and 17 (on 18 it rendered twice as well). Accepted 2026-09-29.
      useBeforePaintEffect(() => {
        if (applied === adopted) return
        formsStorage.delete(own.stored!) // not undefined: the mount stored it before any update
        own.stored = {...adopted}
        if (handle.form) {
          handle.form.reset(adopted)
          formsStorage.set(own.stored, {
            meta: props.meta,
            form: handle.form
          });
        }
        setApplied(adopted)
      }, [adopted]) // eslint-disable-line react-hooks/exhaustive-deps -- the meta of the render that adopted them

      // @Note: when form is submitted, it triggers loading true, and receives old initialValues.
      // If the `initialValues` is computed on the fly and changes reference each time,
      // <Form/> reinitialises while loading, causing the flickering.
      // => either cache `initialValues`, or better, stop <Form/> from reinitializing while loading.
      //    because final-form always re-initializes
      return <Form
        onSubmit={onSubmit}
        {...formOptions}
        mutators={{
          ...arrayMutators,
          setFieldTouched
        }}
        initialValues={adopted}
        render={renderForm}
      />
    }

    // A cast, not a guard: the property is assigned on the next line.
    const Wrapper = React.memo(WithForm) as React.MemoExoticComponent<typeof WithForm> & { WrappedComponent: React.ComponentType<any> }
    // What this wrapper renders, for a caller that renders it WITHOUT the wrapper: the engine's
    // nested documents share their parent's form rather than making one of their own
    // (`engine/Data.tsx`), so they must render this and not the class handed to the decorator.
    Wrapper.WrappedComponent = FormComponent
    return Wrapper
  }
}

/** The user's edits are in: tell the host, or the document this one is nested in. */
function reportDataChanged ({onDataChanged, parent}: { onDataChanged?: unknown, parent?: { onDataChanged?: unknown } }) {
  if (typeof onDataChanged === 'function') {
    onDataChanged()
  } else if (parent && typeof parent.onDataChanged === 'function') {
    parent.onDataChanged();
  }
}

// Before the browser paints, as `componentDidMount` and `componentDidUpdate` ran. On the server it
// is a plain effect: a layout effect there only warns, once per wrapper (see `InputNative`).
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const setFieldTouched = (args: [string, boolean], state: MutableState<Values>) => {
  const [name, touched] = args
  const field = state.fields[name]

  if (field) {
    field.touched = touched
  }
}

/**
 * Mixin to add Class Attributes and Methods commonly used with forms
 * @note: works with react-final-form
 *
 * THE FORM LAYER, AS ITS OWN CLASS (§9.3 step 5). This used to write its members straight onto
 * `Class.prototype` and REPLACE the class's own `UNSAFE_componentWillReceiveProps` and
 * `componentWillUnmount` with wrappers that called captured copies, so the class handed in was a
 * different object before and after: the mutation the engine layer in `rules.tsx` had already
 * stopped making to the class IT is handed. It now returns a subclass and leaves `Class` as written; the
 * originals are reached through `super`, which is what the captures always meant. A caller must
 * render what it RETURNS: `withForm` does, and publishes it as `WrappedComponent`.
 *
 * @param {Object} Class - React Component or PureComponent to build on; it is left as written
 * @param {Function} fieldValues - callback to get form values
 * @param {Function} registeredFieldValues - callback to get form registered values
 * @param {Function} registeredFieldErrors - callback to get form registered errors
 * @returns {Object} a subclass of `Class` with the form properties
 */
/** The readers the form layer is built with, and the engine's error pass. */
export type FormSetupHelpers = {
  fieldValues: (form: FormApi) => Values
  registeredFieldValues: (form: FormApi) => Values | undefined
  registeredFieldErrors: (form: FormApi) => Record<string, unknown> | undefined
  processErrors?: (form: FormApi, meta: any) => void
}

/**
 * @param Class - `any`: the engine's class, whose members the layers add in their class bodies
 */
export function withFormSetup (Class: any, {fieldValues, registeredFieldValues, registeredFieldErrors, processErrors}: FormSetupHelpers) {
  if (!Active.renderField) throw new Error(`${withFormSetup.name} requires Active.renderField to be registered`)

  // Class.contextType = StateContext

  // The props this layer reads: `formProps` (the form's render props, without `form` and
  // `handleSubmit`) and `instance` (the WithForm handle that holds the form), both given by `WithForm`;
  // `initialValues`; and `onChangeState`, called with the instance, or with `{}` on unmount.
  // `formProps` and `instance` are both absent for a NESTED document, which shares its parent's form
  // (`engine/Data.tsx` renders this class without `WithForm`): `form` and `handleSubmit` below then
  // come from `parent`.
  class FormSetup extends Class {
    get form () {
      return this.props.instance ? this.props.instance.form : this.props.parent.form
    }

    get handleSubmit () {
      return this.props.instance ? this.props.instance.handleSubmit : this.props.parent.handleSubmit
    }

    get canSave () {
      // @note: do not use `pristine` because it only reflects visible (i.e. registered inputs)
      //        do not use `valid` because it does not compute correctly on tab changes in FieldsInGroup
      const {loading} = this._props || this.props
      return !loading && !registeredFieldErrors(this.form) && !!this.changedValues
    }

    get formValues () {
      return fieldValues(this.form)
    }

    get registeredValues () {
      return registeredFieldValues(this.form)
    }

    get changedValues () {
      // Have to select all form values, because registered values may not include all input values
      const {initialValues} = this._props || this.props
      return objChanges(initialValues, this.formValues)
    }

    get changedAndRegisteredValues () {
      const values = Object.assign({}, this.registeredValues || {}, this.changedValues || {})
      if (hasObjectValue(values)) return values
      // Callers treat `undefined` as "nothing to submit"; returned explicitly so the getter always returns.
      return undefined
    }

    get validationErrors () {
      const errors = registeredFieldErrors(this.form)
      if (!errors) return null
      const messages = []
      // Use label if defined, for more intuitive error messages
      const fields = this._fields || []
      for (const k in errors) {
        let {label, labelGroup} = fields.find(({name}: { name: string }) => name === k) || {}
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

    get validationErrorsTooltip () {
      const errors = this.validationErrors
      return errors ? <ToolTip top>{errors}</ToolTip> : null
    }

    /**
     * PER INSTANCE, and the comment that used to sit here ("Define instance method") described the
     * intent rather than the code (§9.3 step 4).
     *
     * `Class.prototype.handleChangeInput = debounce(…)` called `debounce` ONCE, so every instance of
     * the decorated class shared a single timer. Two forms typing in the same tick meant the first
     * one's `syncInputChanges` was cancelled by the second and never ran — and the survivor executed
     * against the LAST instance's `this`. Silent, and invisible with one form on the page, which is
     * why it survived: the demo never renders two.
     *
     * The getter builds the debounced function on FIRST ACCESS and caches it as an own property, so
     * the prototype stays the single definition while each instance gets its own timer. It also
     * registers the instance for teardown — `componentWillUnmount` below cancels it, which is what
     * stops a scheduled sync firing into an unmounted component.
     */
    get handleChangeInput (): Debounced<(this: any, ...args: unknown[]) => void> {
      // The handler of the class this builds on, if it has one, runs after the sync. Read through
      // `super` rather than captured when the class was decorated, which is what the capture meant.
      const inherited = super.handleChangeInput
      const own = debounce(function (this: any) {
        // To handle use case when all fields in a group are removed, and no registered values are sent to backend,
        // use placeholder parent field that reserves as registered null value field for the entire group.
        // See <Fields> component for example.
        this.syncInputChanges()
        if (inherited) inherited.apply(this, arguments)
      }, UI.TYPING_DELAY)
      Object.defineProperty(this, 'handleChangeInput', {value: own, configurable: true, writable: true})
      return own
    }

    set handleChangeInput (value: unknown) {
      // Someone assigning over it (a test double, a subclass) must still win.
      Object.defineProperty(this, 'handleChangeInput', {value, configurable: true, writable: true})
    }

    syncInputChanges () {
      const props = this._props || this.props
      if (props.formProps && (!props.formProps.pristine)) reportDataChanged(props)

      const canSave = this.canSave
      if (canSave !== this.state.canSave) {
        this.setState({canSave})
        const {onChangeState} = props
        if (onChangeState) onChangeState(this)
      }
    }

    /**
     * NEW PROPS, IN TWO HALVES (§9.3 step 6). This was `UNSAFE_componentWillReceiveProps`, which did
     * `syncInputChanges` and the error pass before the render. The document host calls this at the
     * same point, during the render, where only this document's own state may change. So here the
     * layer works out whether the document can be saved with the props it is about to render with,
     * and keeps that in its state. What that owes the host, `onDataChanged` and `onChangeState`, and
     * the error pass, wait for the commit, in `componentDidUpdate` below. A render may run twice, so
     * what is owed is a set of flags, which are the same the second time.
     *
     * @Note: using componentDidUpdate comparison logic is not reliable,
     * because on the last re-render, Form may trigger `pristine` update without changing initialValues,
     * which will make .canSave false, but this.syncInputChanges() only updated in the previous render, which was true.
     * => thus need to take formProps into consideration
     */
    deriveFromProps (next: any) {
      if (
        !isEqualJSON(next.initialValues, this.props.initialValues) ||
        !isEqualJSON(next.formProps, this.props.formProps)
      ) {
        const owed = this._owed || (this._owed = {})
        if (next.formProps && (!next.formProps.pristine)) owed.dataChanged = true
        // temporarily set to next props for state computation
        this._props = next
        const canSave = this.canSave
        this._props = null
        if (canSave !== this.state.canSave) {
          this.setState({canSave})
          owed.changeState = true
        }
        if (this._meta) owed.errors = true
      }
      if (super.deriveFromProps) super.deriveFromProps(...arguments)
    }

    componentDidUpdate () {
      // In the order `syncInputChanges` and the lifecycle had them: data, save state, errors.
      const owed = this._owed
      this._owed = null
      if (owed) {
        if (owed.dataChanged) reportDataChanged(this.props)
        if (owed.changeState && this.props.onChangeState) this.props.onChangeState(this)
        if (owed.errors && this._meta && processErrors) processErrors(this.form, this._meta)
      }
      if (super.componentDidUpdate) super.componentDidUpdate(...arguments)
    }

    componentDidMount () {
      // StrictMode mounts a component, unmounts it and mounts it again, so `componentWillUnmount`
      // below may have just marked the document as unmounting. It is back: take the mark back, or
      // everything that checks it (a removed field's timer, auto-submit) would stand down for good
      // (§9.3 step 7). The host was told `{}`, which is what it starts from in the usage above, and
      // it is handed the instance on the first change of `canSave`, as without StrictMode.
      if (this.isUnmounting) this.isUnmounting = false
      if (super.componentDidMount) super.componentDidMount(...arguments)
    }

    componentWillUnmount () {
      this.isUnmounting = true
      // Drop a scheduled input sync rather than letting it fire into an unmounted component
      // (§9.3 step 4). Read through `hasOwnProperty` on purpose: touching the accessor would CREATE
      // the debounced function for an instance that never used it, just to cancel nothing.
      if (Object.prototype.hasOwnProperty.call(this, 'handleChangeInput')) this.handleChangeInput.cancel()
      if (this.props.onChangeState) this.props.onChangeState({})
      if (super.componentWillUnmount) super.componentWillUnmount(...arguments)
    }
  }

  // Named after the class it builds on, as `asField` names its own, so a warning or a component stack
  // still says which component it is: `UIRenderLifecycleWithFormSetup` for the engine.
  Object.defineProperty(FormSetup, 'name', {value: Class.name + 'WithFormSetup'})

  // A prototype assignment, NOT a class field, for two reasons. It is a reference shape built from the
  // one the class below keeps on its own prototype, which is why the engine keeps one there. And a
  // field would initialise per instance after the parent constructor returns, overwriting the state
  // `UIRender`'s constructor builds.
  FormSetup.prototype.state = {
    // This state only updates on input changes, for changes in parent props, use this.changedValues
    canSave: false, // used to compare changes for re-rendering, like 'Save' button
    ...Class.prototype.state
  }

  return FormSetup
}
