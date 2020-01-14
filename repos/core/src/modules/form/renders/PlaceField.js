import React, { Component } from 'react'
import { Field } from 'redux-form'
import { isFunction } from '../../../common/utils'
import Place from '../../../components/inputs/Place'

export default class PlaceField extends Component {
  input = ({input, meta: {touched, error} = {}}) => {
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
