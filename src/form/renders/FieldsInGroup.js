import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import Label from 'react-ui-pack/Label'
import Row from 'react-ui-pack/Row'
import { Active } from 'utils-pack'
import { withGroupInputChange } from '../utils'

/**
 * Semantically Related Fields Rendered in a single row
 */
@withGroupInputChange
export default class FieldsInGroup extends PureComponent {
  static propTypes = {
    hint: PropTypes.string, // label to show at the top before rendering fields,
  }

  render () {
    const {hint, className, style} = this.props
    return (
      <>
        {hint && <Label>{hint}</Label>}
        <Row className={classNames('fields-in-group top justify', className)} style={style}>
          {this.fields.map(Active.renderField)}
        </Row>
      </>
    )
  }
}
