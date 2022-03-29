import { FIELD } from 'modules-pack/variables'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Field } from 'react-final-form'
import { cn } from 'react-ui-pack'
import Label from 'react-ui-pack/Label'
import Row from 'react-ui-pack/Row'
import Tabs from 'react-ui-pack/Tabs'
import View from 'react-ui-pack/View'
import { Active, get } from 'utils-pack'
import { withGroupInputChange } from '../utils'

if (!Active.Field) Active.Field = Field

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
    const {
      kind, onChange, float, initialValues, instance, items: __, validate, required,
      hint, label, className, style, ...props
    } = this.props
    const items = this.fields
    switch (kind) {
      /**
       * @Note: Tabs is a special use case, because inactive tabs do not register inputs.
       *        If unregistered input is required, validation does not work.
       *        If input has changed, but not in visible tab, `registeredValues` does not work.
       *        => thus always register input so validation and form changes work as expected.
       */
      case FIELD.TYPE.TABS: // turn each item label to Tab, the rest as tab content
        props.children = (self) => items
          .filter((f, i) => i !== self.state.activeIndex)
          .map(({name, validate}) => {
            if (props.name) name = `${props.name}.${name}`
            return <Active.Field key={name} name={name} validate={validate} component={() => null}/>
          })
        props.items = items.map(({label, ...field}) => {
          return {
            tab: <Label className={cn({required: field.required})}>{label || field.name}</Label>,
            content: () => {
              // @Note: currently only supports uploads for a single file, for multiple files, use UploadGrids.
              //        => this is because initialValues gets reset to only changed files on tab changes.
              // Simulate state change using initialValues, so that component updates between tab changes
              // @note: - avoid using `key`, because unmounting component causes layout shift
              //        - avoid `parser: fileParser` because it strips away file.src needed to show preview
              if (field.view === FIELD.TYPE.UPLOAD_GRID) {
                // Set initialValues to changedValues to recover changed state on tab changes
                // Need to also take into account use case when `initialValues` changes between different entries,
                // and use new initialValues, instead of one from previous entry.
                // The proper solution is to have withForm reset on entry.id changes.
                const name = props.name ? `${props.name}.${field.name}` : field.name
                field.initialValues = get(instance.formValues, name) || field.initialValues
              }
              return Active.renderField(field)
            }
          }
        })
        return <Tabs {...props} />
      default:
        return (
          <Row className="top justify" {...props}>
            {items.map(Active.renderField)}
          </Row>
        )
    }
  }

  render () {
    const {hint, label, className, style} = this.props
    return (
      <View className={cn('fields-in-group', className)} style={style}>
        {hint && <Label>{hint}</Label>}
        {label && <Label>{label}</Label>}
        {this.renderContainer()}
      </View>
    )
  }
}
