import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ACTIVE } from '../../../common/variables'
import Collapse from '../../../components/Collapse'
import Label from '../../../components/Label'
import Row from '../../../components/Row'
import { withGroupInputChange } from '../../../components/utils'
import { FIELD_RENDER } from '../constants'
import { DateField, DatesField, DropdownField, InputField, ToggleField } from '../fields'
import Fields from './Fields'
import FieldsWithLevel from './FieldsWithLevel'
import PlaceField from './PlaceField'
import { SliderLabeled } from './renderers'
import UploadGridField from './UploadGridField'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

export * from './renderers'

/**
 * Semantically Related Fields Rendered in a single row
 */
@withGroupInputChange
export class FieldsInGroup extends Component {
  static propTypes = {
    hint: PropTypes.string, // label to show at the top before rendering fields,
  }

  // RENDERS -------------------------------------------------------------------
  render () {
    const {hint} = this.props
    return (
      <>
        {hint && <Label>{hint}</Label>}
        <Row className='fields-in-group top justify'>
          {this.fields.map(renderField)}
        </Row>
      </>
    )
  }
}

/**
 * Dynamic Field Renderer based on given Field attributes
 * @example:
 *    {FIELDS_FOR_CONTACT.map(renderField)}
 *
 * @param {Object} fieldDefinition - attributes
 * @param {Number} i - index of the field in the list
 * @returns {Object} - React component
 */
export function renderField (fieldDefinition, i) {
  let Field
  const {view, ...props} = fieldDefinition
  switch (view) {
    case FIELD_RENDER.COLLAPSE:
      Field = Collapse
      break
    case FIELD_RENDER.DROPDOWN:
      if (props.selection == null) props.selection = true
      Field = DropdownField
      break
    case FIELD_RENDER.DATE:
      Field = DateField
      break
    case FIELD_RENDER.DATES:
      Field = DatesField
      break
    case FIELD_RENDER.SLIDER:
      Field = SliderLabeled
      break
    case FIELD_RENDER.TOGGLE:
      Field = ToggleField
      break
    case FIELD_RENDER.MULTIPLE:
      Field = Fields
      break
    case FIELD_RENDER.MULTIPLE_LEVEL:
      Field = FieldsWithLevel
      break
    case FIELD_RENDER.GROUP:
      Field = FieldsInGroup
      break
    case FIELD_RENDER.PLACE:
      Field = PlaceField
      break
    case FIELD_RENDER.UPLOAD_GRID:
      Field = UploadGridField
      break
    case FIELD_RENDER.INPUT:
    default:
      Field = InputField
  }
  return <Field key={i} {...props} />
}

ACTIVE.renderField = renderField
