import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Field } from 'redux-form'
import { isFunction, isList, isNumber } from '../../common/utils'
import Checkbox from '../../components/Checkbox'
import DropDown from '../../components/Dropdown'
import Input from '../../components/Input'
import DateInput from '../../components/inputs/DateInput'
import Dates from '../../components/inputs/Dates'
import Slider from '../../components/Slider'
import { isRequired } from './validationRules'

/**
 * FORM FIELDS =================================================================
 * Note: must use Class to prevent input from loosing focus on input 'onChange'
 * =============================================================================
 */

export class DateField extends Component {
  input = ({input, meta: {touched, error} = {}}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, normalize, error: errorMessage, validate: _, ...props} = this.props
    return (
      <DateInput
        {...input}
        // do not pass `validate` prop because DateInput's internal value is representation of time in date string
        value={Number(input.value)}
        onBlur={() => input.onBlur()} // prevent value change, but need onBlur to set touched for validation
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(normalize ? normalize(value) : value)
        }}
        error={touched && error && (errorMessage || error)}
        touched={touched}
        {...props}
      />
    )
  }

  render = () => {
    const {name, disabled, validate} = this.props
    return <Field {...{name, disabled, validate}} component={this.input}/>
  }
}

export class DatesField extends Component {
  input = ({input, meta: {touched, error} = {}}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, normalize, error: errorMessage, ...props} = this.props
    return (
      <Dates
        {...input}
        value={input.value || []}
        onBlur={() => input.onBlur()} // prevent value change, but need onBlur to set touched for validation
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(normalize ? normalize(value) : value)
        }}
        error={touched && error && (errorMessage || error)}
        touched={touched}
        {...props}
      />
    )
  }

  render = () => {
    const {name, disabled, validate} = this.props
    return <Field {...{name, disabled, validate}} component={this.input}/>
  }
}

export class DropdownField extends Component {
  input = ({input, meta: {touched, error} = {}}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, normalize, error: errorMessage, validate: _, ...props} = this.props
    return (
      <DropDown
        {...input}
        value={input.value || (props.multiple ? [] : '')}
        onBlur={() => input.onBlur()} // prevent value change, but need onBlur to set touched for validation
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(normalize ? normalize(value) : value)
        }}
        error={touched && error && (errorMessage || error)}
        {...props}
      />
    )
  }

  render = () => {
    const {name, disabled, options, validate} = this.props
    return <Field {...{name, disabled, options, validate}} component={this.input}/>
  }
}

export class InputField extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    info: PropTypes.any,  // help text or component to show on focus
    error: PropTypes.any,  // help text or component to show on invalid input
    value: PropTypes.any,
    onChange: PropTypes.func,
    normalize: PropTypes.func,
    // @Note: see <Input> component for docs
  }

  // do not use ...props from input, because it is shared by <Field> instances
  input = ({input, meta: {touched, error} = {}}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, normalize, error: errorMessage, validate: _, ...props} = this.props
    return (
      <Input
        {...input}
        value={input.value}
        onBlur={() => input.onBlur()} // prevent value change, but need onBlur to set touched for validation
        onChange={value => {
          if (props.type === 'number') value = value !== '' ? Number(value) : null
          input.onChange(value)
          isFunction(onChange) && onChange(normalize ? normalize(value) : value)
        }}
        error={touched && error && (errorMessage || error)}
        {...props} // allow forceful value override
      />
    )
  }

  // Rerender Field for all prop changes
  render () {
    const {error: _, info: __, lefty: ___, float: ____, stickyPlaceholder: _____, ...props} = this.props
    return <Field {...props} component={this.input}/>
  }
}

/**
 * Generic Slider that can be rendered horizontally or vertically, with label or tooltip
 */
export class SliderField extends Component {
  input = ({input}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, defaultValue, denormalize, normalize, ...props} = this.props
    this.val = input.value
    this.value = isList(input.value) ? input.value : (isNumber(input.value) ? input.value : defaultValue)
    this.onChange = input.onChange
    return (
      <Slider
        value={denormalize ? denormalize(this.value) : this.value}
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(normalize ? normalize(value) : value)
        }}
        {...props}
      />
    )
  }

  componentDidMount () {
    // Auto dispatch action to set min value if default value is out of min-max range,
    // because we cannot use initialValues when new slider is added in <FieldsWithLevel />,
    // and need a way to detect changes to enable saving.
    // Only dispatchChangeOnMount if field is added for the first time.
    const {min, onChange, dispatchChangeOnMount} = this.props
    const valueToChange = this.value < min ? min : ((dispatchChangeOnMount && this.val === '') ? this.value : null)
    if (valueToChange == null) return
    this.onChange(valueToChange)
    onChange && onChange(valueToChange)
  }

  render = () => {
    const {name, disabled, normalize} = this.props
    return <Field {...{name, disabled, normalize}} component={this.input}/>
  }
}

export class ToggleField extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    labelTrue: PropTypes.string,
    labelFalse: PropTypes.string,
    value: PropTypes.bool,
    onChange: PropTypes.func,
    normalize: PropTypes.func,
    id: PropTypes.string,
    danger: PropTypes.bool,
    // @Note: see <Checkbox> component for docs
  }
  input = ({input}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, label, name, ...props} = this.props
    return (
      <Checkbox
        type='toggle'
        label={label || name}
        value={input.value}
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(value)
        }}
        {...props} // allow forceful value override
      />
    )
  }

  // Rerender Field for all prop changes to update 'labelTrue/False'
  render = () => {
    const {onChange: _, ...props} = this.props  // do not pass 'onChange' to Field because it fires event as argument
    return <Field {...props} component={this.input}/>
  }
}
