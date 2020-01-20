import React, { Component } from 'react'
import { Field } from 'redux-form'
import { isFunction } from '../../../common/utils'
import UploadGrid from '../../upload/views/UploadGrid'
import { isRequired } from '../validationRules'

export default class UploadGridField extends Component {
  input = ({input}) => {
    if (this.props.readonly && isRequired(input.value)) return null
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
