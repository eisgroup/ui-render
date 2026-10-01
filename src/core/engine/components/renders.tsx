import { asField } from '../../modules/form'
import { DropdownField, InputField, ToggleField, InputNumberField, InputDateField, SliderField } from '../../modules/form/inputs'
import Upload from '../../modules/upload/views/Upload'
import { FIELD } from '../../modules/variables'
import React from 'react'
import { PlaceholderField } from '../../components/PlaceholderField'
import { Active } from '../../utils'

const UploadField = asField(Upload, {sanitize: (value) => value || undefined})

/** A field's meta, as `renderField` reads it: its view, its input type, and the props for the field. */
export type FieldDefinition = { view?: string, type?: string, [key: string]: unknown }

/** What a field resolves to: the engine's fields are still typed as they are in `modules/form`. */
type FieldComponent = React.ComponentType<any>

export function renderField (this: unknown, fieldDefinition: FieldDefinition, i?: number) {
  let Field: FieldComponent
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
    case FIELD.TYPE.SLIDER:
      Field = SliderField
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
