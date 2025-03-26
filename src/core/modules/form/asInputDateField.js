import { Field } from 'react-final-form'
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { isRequired } from 'ui-react-pack/inputs/validationRules'
import { storedTouched } from 'ui-modules-pack/form/utils'
import { Active } from 'ui-utils-pack'

export function asInputDateField (InputComponent, {sanitize} = {}) {
    if (!Active.Field) Active.Field = Field
    const Class = class extends PureComponent {
        static propTypes = {
            // Input `name` attribute
            name: PropTypes.string.isRequired,
            // Instance of the Class component decorated withFormSetup (i.e withForm)
            instance: PropTypes.object,
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

        state = {
            selectPreviousValue: null
        }

        get value () {
            if (this._value !== void 0) {
                return this._value
            }
            return null
        }

        set value (v) {
            this._value = v
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
                this.value = value === void 0
                    ? (pristine && defaultValue != null ? (format ? format(defaultValue) : defaultValue) : value)
                    : value

            }

            // Hide this field if it's readonly and has no value.
            if (this.props.readonly && isRequired(this.value != null ? this.value : this.props.value)) return null

            this.input = input

            if (instance) this.initValues = instance.props.initialValues

            const nextValue = this.value

            const errorText = error && (storedTouched[input.name] || touched || !pristine) && (err || error)

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

        handleFocus = (...args) => {
            this.hasFocus = true
            return this.input.onFocus(...args)
        }


        handleChange = (value, ...args) => {
            const {onChange, normalize, parse = normalize} = this.props

            if (this.hasFocus) {
                this.value = value
            }

            this.input.onChange(value) // final-form input.onChange can accept 'event' or 'value'
            onChange && onChange(parse ? parse(value) : value, ...args)
        }


        render () {
            const {
                name, disabled, normalize, format, parse = normalize, validate, options
            } = this.props
            return <Active.Field {...{name, disabled, normalize, format, parse, validate, options}}
                                 component={this.Input}/>
        }
    }

    Object.defineProperty(Class, 'name', {value: (InputComponent.name || InputComponent.constructor.name) + 'AsField'})
    return Class
}