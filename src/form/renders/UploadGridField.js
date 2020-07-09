import React, { Component } from 'react'
import { isRequired } from 'react-ui-pack/inputs/validationRules'
import { Field } from 'redux-form'
import { isFunction } from 'utils-pack'
import UploadGrid from '../../../todo/modules/upload/views/UploadGrid'

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
