import classNames from 'classnames'
import { FIELD } from 'modules-pack/variables'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import Label from 'react-ui-pack/Label'
import Row from 'react-ui-pack/Row'
import Tabs from 'react-ui-pack/Tabs'
import { Active, get } from 'utils-pack'
import { withGroupInputChange } from '../utils'

/**
 * Semantically Related Fields Rendered Together (as single Row by default)
 * @example:
 *    FIELD.DEF = {
 *      [FIELD.ID.GROUP]: {
 *        items: [{id: FIELD.ID.FILE}...],
 *        kind: FIELD.TYPE.TABS,
 *        view: FIELD.TYPE.GROUP
 *      }
 *    }
 */
@withGroupInputChange
export default class FieldsInGroup extends PureComponent {
  static propTypes = {
    kind: PropTypes.string, // one of FIELD.TYPE, defaults to FIELD.TYPE.ROW
    hint: PropTypes.string, // label to show at the top before rendering fields
    //... other props to pass to the container
  }

  renderContainer = () => {
    const {kind, className, style, onChange, instance, items: __, float, initialValues, ...containerProps} = this.props
    const items = this.fields
    const props = {className: classNames('fields-in-group top justify', className), style, ...containerProps}
    switch (kind) {
      case FIELD.TYPE.TABS: // turn each item label to Tab, the rest as tab content
        props.tabs = []
        props.panels = []
        items.forEach(({label, ...field}) => {
          props.tabs.push(label || field.name)
          props.panels.push(() => {
            // @Note: currently only supports uploads for a single file, for multiple files, use UploadGrids.
            //        => this is because initialValues gets reset to only changed files on tab changes.
            // Simulate state change using initialValues, so that component updates between tab changes
            // @note: - avoid using `key`, because unmounting component causes layout shift
            //        - avoid `parser: fileParser` because it strips away file.src needed to show preview
            if (field.view === FIELD.TYPE.UPLOAD_GRID) {
              // Set initialValues to changeValues to recover changed state on tab changes
              const name = [field.name]
              if (containerProps.name) name.unshift(containerProps.name)
              field.initialValues = get(instance.formValues, name) || field.initialValues
            }
            return Active.renderField(field)
          })
        })
        return <Tabs {...props} />
      default:
        return (
          <Row {...props}>
            {items.map(Active.renderField)}
          </Row>
        )
    }
  }

  render () {
    const {hint, label} = this.props
    return (
      <>
        {hint && <Label>{hint}</Label>}
        {label && <Label>{label}</Label>}
        {this.renderContainer()}
      </>
    )
  }
}
