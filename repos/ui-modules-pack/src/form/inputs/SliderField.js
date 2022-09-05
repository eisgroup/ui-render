import React, { PureComponent } from 'react'
import { Field } from 'react-final-form'
import { isRequired } from 'ui-react-pack/inputs/validationRules'
import { Slider } from 'ui-react-pack/Slider'
import { Active, isFunction, isList, isNumber } from 'ui-utils-pack'

if (!Active.Field) Active.Field = Field

/**
 * Slider Field connected with react-final-form or redux-form
 * Can be rendered horizontally or vertically, with label or tooltip
 */
export default class SliderField extends PureComponent {
  input = ({input}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, defaultValue, denormalize, normalize, format, parse = normalize, ...props} = this.props
    this.val = input.value
    this.value = isList(input.value) ? input.value : (isNumber(input.value) ? input.value : defaultValue)
    this.onChange = input.onChange
    return (
      <Slider
        value={denormalize ? denormalize(this.value) : this.value}
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(parse ? parse(value) : value)
        }}
        {...props}
      />
    )
  }

  componentDidMount () {
    // Auto dispatch action to set min value if default value is out of min-max range,
    // because we cannot use initialValues when new slider is added in <Active.FieldsWithLevel />,
    // and need a way to detect changes to enable saving.
    // Only dispatchChangeOnMount if field is added for the first time.
    const {min, onChange, dispatchChangeOnMount} = this.props
    const valueToChange = this.value < min ? min : ((dispatchChangeOnMount && this.val === '') ? this.value : null)
    if (valueToChange == null) return
    this.onChange(valueToChange)
    onChange && onChange(valueToChange)
  }

  render = () => {
    const {name, disabled, normalize, format = normalize, parse = normalize, validate} = this.props
    return <Active.Field {...{name, disabled, normalize, format, parse, validate}} component={this.input}/>
  }
}
