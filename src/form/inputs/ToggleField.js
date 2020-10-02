import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Field } from 'react-final-form'
import { Checkbox } from 'react-ui-pack/Checkbox'
import { isRequired } from 'react-ui-pack/inputs/validationRules'
import { Active, isFunction } from 'utils-pack'

if (!Active.Field) Active.Field = Field

/**
 * Toggle Field connected with react-final-form or redux-form
 */
export default class ToggleField extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    labelTrue: PropTypes.string,
    labelFalse: PropTypes.string,
    value: PropTypes.bool,
    onChange: PropTypes.func,
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
    return <Active.Field {...props} component={this.input}/>
  }
}
