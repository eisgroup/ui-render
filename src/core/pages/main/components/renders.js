import { asField } from '../../../modules/form'
import { DropdownField, InputField, ToggleField, InputNumberField, InputDateField } from '../../../modules/form/inputs'
import Upload from '../../../modules/upload/views/Upload'
import { FIELD } from '../../../modules/variables'
import React from 'react'
import { PlaceholderField } from '../../../components/PlaceholderField'
import { Active } from '../../../utils'

const UploadField = asField(Upload, {sanitize: (value) => value || undefined})

export function renderField (fieldDefinition, i) {
  let Field
  const {view, type, ...props} = fieldDefinition
  switch (view) {
    case FIELD.TYPE.INPUT:
      Field = InputField
      break
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

  if (type === 'number') {
    Field = InputNumberField
  }

  if (type === 'date') {
    Field = InputDateField
  }

  return <Field key={i} {...props} type={type} />
}

Active.renderField = renderField
