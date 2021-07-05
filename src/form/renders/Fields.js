import classNames from 'classnames'
import { TYPE_BY } from 'modules-pack/variables/definitions'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Field } from 'react-final-form'
import Dropdown from 'react-ui-pack/Dropdown'
import View from 'react-ui-pack/View'
import { Active, cleanList, isEqual } from 'utils-pack'
import { _ } from 'utils-pack/translations'
import { InputField } from '../inputs'

if (!Active.Field) Active.Field = Field

/**
 * List of Predefined Form Fields with dropdown search input to add and remove them (ex. Languages)
 */
export default class Fields extends PureComponent {
  static propTypes = {
    // `kind` is used to render "+ Add Kind" dropdown label, because `options` has no translated value for the `kind`,
    kind: PropTypes.string.isRequired, // TYPE underscore value (ex. TYPE.LANGUAGE._)
    options: PropTypes.arrayOf(PropTypes.shape({ // Dropdown options (ex. OPTIONS.LANGUAGE.items)
      value: PropTypes.any.isRequired, // ID or DEFINITION._ value
      text: PropTypes.string.isRequired, // Localised String or getter DEFINITION.name
    })).isRequired,
    name: PropTypes.string, // input name prefix for redux form (ex. `phones.`), defaults to given `kind`
    renderField: PropTypes.func, // function(field, index, onRemove) to render each field, defaults to <InputField/>
    initialValues: PropTypes.object, // used to initiate fields to show at the beginning
    minFields: PropTypes.number, // minimum number of fields to keep before allow removing fields
    addPlaceholder: PropTypes.string, // placeholder for adding fields
    labelGroup: PropTypes.string, // label used when no fields selected
    // ...other props to pass to <Field/> component
  }

  static defaultProps = {
    initialValues: {}
  }

  state = {
    fields: this.fields(), // example: [{value: 'en', text: 'English'}]
    justAddedField: '', // one of options.value - to enable autofocus
  }

  fields ({initialValues, options} = this.props) {
    return cleanList(Object.keys(initialValues).map(v => options.find(o => o.value === v)))
  }

  UNSAFE_componentWillReceiveProps (next) {
    if (!isEqual(next.initialValues, this.props.initialValues))
      this.setState({fields: this.fields(next)})
  }

  // @see asField.componentWillUnmount for reference
  handleDeleteField = (_name) => {
    const fields = this.state.fields.filter(f => f.value !== _name)
    this.setState({fields}, () => {
      // When no fields are left, dispatch action to set parent wrapper field as null to reset on backend,
      // because redux-form persists the deleted field value in state.
      if (!fields.length && this.onChange) this.onChange(null)
    })
  }

  handleAddField = (_name) => {
    if (!_name) return
    const field = this.props.options.find(o => o.value === _name)
    this.setState({fields: cleanList(this.state.fields.concat(field)), justAddedField: _name})
    // When new field is added, dispatch action to set value so the form can detect changes from initial values
    // this should be done by defining prop `dispatchChangeOnMount` = true, then let SliderField handle it,
    // because this container does not know which form the field belongs to.
  }

  placeholderInput = ({input}) => {
    this.onChange = input.onChange
    return null
  }

  // RENDERS -------------------------------------------------------------------
  renderField = (field) => {
    const {name, kind, minFields, fields, addPlaceholder, labelGroup, renderField, ...props} = this.props
    const {justAddedField} = this.state
    const {value, text} = field
    const id = name ? `${name}.${value}` : `${kind}.${value}`
    if (!props.readonly && (!minFields || minFields < this.state.fields.length)) {
      props.icon = 'delete'
      props.onClickIcon = () => this.handleDeleteField(value)
    }
    return <InputField key={id} name={id} label={text} autofocus={justAddedField === value} {...props}/>
  }

  render () {
    const {
      name, kind, options, renderField, labelGroup, addPlaceholder,
      readonly, required, validate,
      className, style
    } = this.props
    const {fields} = this.state
    const hasFields = fields.length > 0
    const fieldsLabel = hasFields ? undefined : (labelGroup || TYPE_BY[kind].name)
    const renderItem = renderField ? ((obj, i) => renderField(obj, i, this.handleDeleteField)) : this.renderField
    const fieldOptions = options
      .filter(({value}) => value && !fields.find(f => f.value === value)) // filter out empty string '' and 0
    return (
      // `min-width` is required to prevent sliders from collapsing when placeholder Dropdown has short text.
      // This only happen in FormInSteps or modals, where container is centered and has undetermined minimum width.
      // `min-width-290` causes overflow in certain layout, so use a lesser value
      <View className={classNames('app__fields min-width-260', className)} style={style}>
        {/*
        Only register placeholder parent field when there are no fields left (to reset on backend)
        because if registered when there are existing fields, withForm's  this.changedValues grabs all values within it,
        and will make deleting fields impossible.
        */}
        {name && !fields.length && <Active.Field name={name} validate={validate} component={this.placeholderInput}/>}
        {fields.map(renderItem)}
        {!readonly && !!fieldOptions.length &&
        <Dropdown
          search selection
          value=""
          label={fieldsLabel}
          required={required && !hasFields}
          placeholder={addPlaceholder || `+ ${_.ADD} ${TYPE_BY[kind].name}`}
          onSelect={this.handleAddField}
          options={fieldOptions}
        />}
      </View>
    )
  }
}
