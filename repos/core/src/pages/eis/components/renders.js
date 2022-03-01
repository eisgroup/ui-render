import { asField } from 'modules-pack/form'
import { DropdownField, InputField, ToggleField, } from 'modules-pack/form/inputs'
import Upload from 'modules-pack/upload/views/Upload'
import { FIELD } from 'modules-pack/variables'
import React from 'react'
import { PlaceholderField } from 'react-ui-pack/PlaceholderField'
import { Active } from 'utils-pack'

const UploadField = asField(Upload, {sanitize: (value) => value || undefined})

export function renderField (fieldDefinition, i) {
  let Field
  const {view, ...props} = fieldDefinition
  switch (view) {
    case FIELD.TYPE.INPUT:
      Field = InputField
      break
    case FIELD.TYPE.DROPDOWN:
    case FIELD.TYPE.SELECT:
      Field = DropdownField
      break
    case FIELD.TYPE.TOGGLE:
      Field = ToggleField
      break
    case FIELD.TYPE.UPLOAD:
      Field = UploadField
      break
    default:
      Field = PlaceholderField.bind(this, {name: view})
  }
  return <Field key={i} {...props} />
}

Active.renderField = renderField
