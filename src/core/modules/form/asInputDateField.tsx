import { Field } from 'react-final-form'
import type { FieldRenderProps } from 'react-final-form'
import React, { useRef } from 'react'
import { isRequired } from '../../components/inputs/validationRules'
import { resetsOf, touchedFor } from '../../state/formRegistry'
import { Active } from '../../utils'
import { _ } from '../../utils/translations'
import { revalidate } from './batchedForm'
import { isUnset, namedField } from './utils'
import { useFixableField } from './useFixableField'

/** What final-form hands the input: its `input` props, without `value`, which the field caches. */
type FieldInput = Omit<FieldRenderProps<unknown>['input'], 'value'>
type ValueTransform = (value: unknown) => unknown

/** The props the field reads; the rest are passed to the input it renders. */
export type DateFieldProps = {
    /** Input `name` attribute */
    name: string
    /**
     * The document the field is rendered by, the class decorated withFormSetup (i.e withForm): its
     * form, and the values it started with
     */
    instance?: { form?: object, props: { initialValues?: unknown } }
    defaultValue?: unknown
    value?: unknown
    readonly?: boolean
    disabled?: boolean
    /** Help text or component to show on invalid input */
    error?: React.ReactNode
    onChange?: (value: unknown, ...args: unknown[]) => void
    /** Called after the field's own focus handling, with what the input passed it; never in its place */
    onFocus?: unknown
    /** Called after the field's own blur handling, with what the input passed it; never in its place */
    onBlur?: unknown
    format?: ValueTransform
    normalize?: ValueTransform
    parse?: ValueTransform
    /** Handed the field's state too when it declares three parameters, or none, as final-form hands it */
    validate?: (value: unknown, allValues: object, state?: unknown) => unknown
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
export function asInputDateField (InputComponent: React.ComponentType<any>, {sanitize}: { sanitize?: (value: unknown, props: object) => unknown } = {}) {
    if (!Active.Field) Active.Field = Field
    /**
     * What a mounted date field holds, one object for its lifetime: the class this was until 2026-10-06,
     * a `PureComponent`, is now a plain class the function component below hosts (`asField` says how).
     */
    class FieldInstance {
        declare props: DateFieldProps

        constructor (props: DateFieldProps) {
            this.props = props
        }

        // Declared only, as every field without a value here: Babel emits no field for them.
        declare _value: unknown
        declare hasFocus?: boolean
        declare input: FieldInput
        declare initValues: unknown
        /** The text the field was left with that is no date, which the input shows (`onInvalidText`), and when */
        declare invalidText?: string | null
        declare invalidSince?: number
        /** The input's key: one more when the input must show the value again, in place of such text */
        declare inputKey?: number

        /** The form the field's document renders it in, which counts its resets; none outside a document. */
        get form () {
            const {instance} = this.props
            return instance && instance.form
        }

        /**
         * `INVALID_DATE` while the field shows text that is no date, unless the `reset` action has reset the form since:
         * its value is the date it had, which says nothing of the text.
         */
        get invalid () {
            return this.invalidText != null && this.invalidSince === resetsOf(this.form) ? _.INVALID_DATE : undefined
        }

        get value () {
            if (this._value !== void 0) {
                return this._value
            }
            return null
        }

        set value (v: unknown) {
            this._value = v
        }

        // do not use ...props from input, because it is shared by <Active.Field> instances
        // @Note: react-final-form fires `format()` when `input.value` getter is called
        Input = ({input: {value, ...input}, meta: {touched, error, pristine, initial} = {}}: FieldRenderProps<unknown>) => {
            const {
                onChange, error: err, defaultValue, normalize, format, parse, validate,
                instance, onRemoveChange, onFocus, onBlur, ...props
            } = this.props

            if (!this.hasFocus) { // use cached `value` while editing to prevent format/parse bugs and rerender
                // @Note: defaultValue is only used for UI, internal value is still undefined
                this.value = isUnset(value, initial)
                    ? (pristine && defaultValue != null ? (format ? format(defaultValue) : defaultValue) : value)
                    : value

            }

            // Hide this field if it's readonly and has no value.
            if (this.props.readonly && isRequired(this.value != null ? this.value : this.props.value)) return null

            if (this.invalidText != null && !this.invalid) {
                // The form was reset since the field was left with text that is no date: a new input shows the value.
                this.invalidText = null
                this.inputKey = (this.inputKey || 0) + 1
            }

            this.input = input

            if (instance) this.initValues = instance.props.initialValues

            const nextValue = this.value

            // Reaches its form through the instance every engine-rendered field is given.
            const rememberedTouched = instance && instance.form ? touchedFor(instance.form) : {}
            const errorText = error && (rememberedTouched[input.name] || touched || !pristine) && (err || error)

            return (
                <InputComponent
                    key={this.inputKey}
                    {...input}
                    value={nextValue}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur} // prevent value change, but need onBlur to set touched for validation
                    onChange={this.handleChange}
                    onInvalidText={this.handleInvalidText}
                    error={errorText} // only show error after user interaction
                    {...props} // allow forceful value override
                />
            )
        }

        // The field's validator, around its own: final-form hands a validator the field's state only when it declares
        // three parameters, or none, and works that state out for it. So there are two, and the field takes the one
        // its own validator asks for (below).
        validateValues = (value: unknown, allValues: object) => {
            const {validate} = this.props
            return this.invalid || (validate ? validate(value, allValues) : undefined)
        }

        // An assertion, not a guard: a field takes this one only for a validator of its own.
        validateWithState = (value: unknown, allValues: object, state: unknown) =>
            this.invalid || this.props.validate!(value, allValues, state)

        /**
         * The text the field is left with when it is no date, or null once it shows a date or nothing. Its value is still
         * the date it had, so final-form has nothing to validate it again for: the form is asked to.
         */
        handleInvalidText = (text: string | null) => {
            this.invalidText = text
            this.invalidSince = resetsOf(this.form)
            revalidate(this.form)
        }

        // The field's own handling first, then the one a meta or a host gave it, as in `asField`.
        handleFocus = (...args: Parameters<FieldInput['onFocus']>) => {
            this.hasFocus = true
            const focused = this.input.onFocus(...args)
            const {onFocus} = this.props
            if (typeof onFocus === 'function') onFocus(...args)
            return focused
        }

        handleBlur = (...args: Parameters<FieldInput['onBlur']>) => {
            this.hasFocus = false
            const blurred = this.input.onBlur(...args)
            const {onBlur} = this.props
            if (typeof onBlur === 'function') onBlur(...args)
            return blurred
        }


        handleChange = (value: unknown, ...args: unknown[]) => {
            const {onChange, normalize, parse = normalize} = this.props

            if (this.hasFocus) {
                this.value = value
            }

            this.input.onChange(value) // final-form input.onChange can accept 'event' or 'value'
            onChange && onChange(parse ? parse(value) : value, ...args)
        }


    }

    function AsInputDateField (props: DateFieldProps) {
        const own = useRef<FieldInstance | null>(null)
        if (own.current === null) own.current = new FieldInstance(props)
        const field = own.current
        field.props = props
        useFixableField(props)
        const {name, disabled, normalize, format, parse = normalize, validate, options} = props
        // Whatever its own, since text that is no date is an error in an optional field too.
        const validator = typeof validate === 'function' && (validate.length === 0 || validate.length === 3)
            ? field.validateWithState
            : field.validateValues
        // A cast, not a guard, read at render: final-form's `Field`, unless something replaced it.
        const ActiveField = Active.Field as typeof Field
        return <ActiveField {...{name, disabled, normalize, format, parse, options}} validate={validator}
                             component={field.Input}/>
    }

    return namedField(AsInputDateField, InputComponent, FieldInstance)
}
