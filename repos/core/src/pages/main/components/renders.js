import { asField } from 'ui-modules-pack/form'
import { DropdownField, InputField, ToggleField, InputNumberField } from 'ui-modules-pack/form/inputs'
import Upload from 'ui-modules-pack/upload/views/Upload'
import { FIELD } from 'ui-modules-pack/variables'
import React from 'react'
import { PlaceholderField } from 'ui-react-pack/PlaceholderField'
import { Active } from 'ui-utils-pack'

const UploadField = asField(Upload, {sanitize: (value) => value || undefined})

export function renderField (fieldDefinition, i) {
  let Field
  const {view, type, ...props} = fieldDefinition
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

  if (type === 'number') {
    Field = InputNumberField
  }

  return <Field key={i} {...props} type={type} />
}

Active.renderField = renderField
