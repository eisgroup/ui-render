import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ACTIVE, FIELD } from '../../../common/variables'
import Label from '../../../components/Label'
import Row from '../../../components/Row'
import { withGroupInputChange } from '../../../components/utils'
import { DateField, DatesField, DropdownField, InputField, ToggleField } from '../inputs'
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
    const {hint, className, style} = this.props
    return (
      <>
        {hint && <Label>{hint}</Label>}
        <Row className={classNames('fields-in-group top justify', className)} style={style}>
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
    case FIELD.TYPE.INPUT:
      Field = InputField
      break
    case FIELD.TYPE.DROPDOWN:
      if (props.selection == null) props.selection = true
      Field = DropdownField
      break
    case FIELD.TYPE.DATE:
      Field = DateField
      break
    case FIELD.TYPE.DATES:
      Field = DatesField
      break
    case FIELD.TYPE.SLIDER:
      Field = SliderLabeled
      break
    case FIELD.TYPE.TOGGLE:
      Field = ToggleField
      break
    case FIELD.TYPE.MULTIPLE:
      Field = Fields
      break
    case FIELD.TYPE.MULTIPLE_LEVEL:
      Field = FieldsWithLevel
      break
    case FIELD.TYPE.GROUP:
      Field = FieldsInGroup
      break
    case FIELD.TYPE.PLACE:
      Field = PlaceField
      break
    case FIELD.TYPE.UPLOAD_GRID:
      Field = UploadGridField
      break
    default:
      Field = InputField
  }
  return <Field key={i} {...props} />
}

ACTIVE.renderField = renderField
