import { Field } from 'react-final-form'
import type { FieldRenderProps } from 'react-final-form'
import React, { useRef } from 'react'
import { isRequired } from '../../components/inputs/validationRules'
import { touchedFor } from '../../state/formRegistry'
import { Active } from '../../utils'
import { namedField } from './utils'

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
export function asInputDateField (InputComponent: React.ComponentType<any>, {sanitize}: { sanitize?: (value: unknown, props: object) => unknown } = {}) {
    if (!Active.Field) Active.Field = Field
    /**
     * What a mounted date field holds, one object for its lifetime: the class this was until 2026-10-06,
     * a `PureComponent`, is now a plain class the function component below hosts (`asField` says how).
     */
    class FieldInstance {
        props: DateFieldProps

        constructor (props: DateFieldProps) {
            this.props = props
        }

        _value: unknown
        hasFocus?: boolean
        input!: FieldInput
        initValues: unknown

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
        Input = ({input: {value, ...input}, meta: {touched, error, pristine} = {}}: FieldRenderProps<unknown>) => {
            const {
                onChange, error: err, defaultValue, normalize, format, parse, validate,
                instance, onRemoveChange, ...props
            } = this.props

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

            const nextValue = this.value

            // Reaches its form through the instance every engine-rendered field is given.
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

        handleBlur = (...args: Parameters<FieldInput['onBlur']>) => {
            this.hasFocus = false
            return this.input.onBlur(...args)
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
        const {name, disabled, normalize, format, parse = normalize, validate, options} = props
        // A cast, not a guard, read at render: final-form's `Field`, unless something replaced it.
        const ActiveField = Active.Field as typeof Field
        return <ActiveField {...{name, disabled, normalize, format, parse, validate, options}}
                             component={field.Input}/>
    }

    return namedField(AsInputDateField, InputComponent, FieldInstance)
}
