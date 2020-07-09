import React, { Component } from 'react'
import Place from 'react-ui-pack/inputs/Place'
import { isRequired } from 'react-ui-pack/inputs/validationRules'
import { Field } from 'redux-form'
import { isFunction } from 'utils-pack'

export default class PlaceField extends Component {
  input = ({input, meta: {touched, error} = {}}) => {
    if (this.props.readonly && isRequired(input.value)) return null
    const {onChange, error: errorMessage, ...props} = this.props
    return (
      <Place
        {...input}
        value={input.value ? input.value : undefined}
        onBlur={() => input.onBlur()} // prevent value change, but need onBlur to set touched for validation
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(value)
        }}
        error={touched && error && (errorMessage || error)}
        {...props}
      />
    )
  }

  render () {
    const {name, disabled, validate} = this.props
    return <Field {...{name, disabled, validate}} component={this.input}/>
  }
}
