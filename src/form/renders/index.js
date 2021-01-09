import classNames from 'classnames'
import { FIELD } from 'modules-pack/variables'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { withGroupInputChange } from 'react-ui-pack'
import Label from 'react-ui-pack/Label'
import { PlaceholderField } from 'react-ui-pack/PlaceholderField'
import Row from 'react-ui-pack/Row'
import { Active } from 'utils-pack'
import {
  DateField,
  DatesField,
  DropdownField,
  InputField,
  PlaceField,
  ToggleField,
  UploadGridField,
  UploadGridsField
} from '../inputs'
import Fields from './Fields'
import FieldsWithLevel from './FieldsWithLevel'
import { SliderLabeled } from './renderers'

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
export class FieldsInGroup extends PureComponent {
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
 * @param {Number} [i] - index of the field in the list
 * @returns {Object} - React component
 */
export function renderField (fieldDefinition, i) {
  let Field
  const {view, ...props} = fieldDefinition
  switch (view) {
    case FIELD.TYPE.INPUT:
      Field = InputField
      break
    case FIELD.TYPE.SELECT:
    case FIELD.TYPE.DROPDOWN:
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
    case FIELD.TYPE.UPLOAD_GRIDS:
      Field = UploadGridsField
      break
    default:
      Field = PlaceholderField.bind(this, {name: view})
  }
  return <Field key={i} {...props} />
}

Active.renderField = renderField
