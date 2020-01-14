import React, { Component } from 'react'
import { Field } from 'redux-form'
import { isFunction } from '../../../common/utils'
import UploadGrid from '../../../components/UploadGrid'

export default class UploadGridField extends Component {
  input = ({input}) => {
    const {onChange, ...props} = this.props
    return (
      <UploadGrid
        value={input.value ? input.value : []}
        onChange={value => {
          input.onChange(value)
          isFunction(onChange) && onChange(value)
        }}
        {...props}
      />
    )
  }

  render = () => <Field name={this.props.name} disabled={this.props.disabled} component={this.input}/>
}
