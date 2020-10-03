import classNames from 'classnames'
import { DEFINITION, TYPE_BY } from 'modules-pack/variables/definitions'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Field } from 'react-final-form'
import Dropdown from 'react-ui-pack/Dropdown'
import View from 'react-ui-pack/View'
import { Active, cleanList, findObjByKeys, isEqual } from 'utils-pack'
import { InputField } from '../inputs'

if (!Active.Field) Active.Field = Field

/**
 * List of Predefined Form Fields with dropdown search input to add and remove them (ex. Languages)
 */
export default class Fields extends PureComponent {
  static propTypes = {
    kind: PropTypes.string.isRequired, // TYPE key (ex. TYPE.PHONE._)
    options: PropTypes.arrayOf(PropTypes.shape({ // Dropdown options (ex. OPTIONS.PHONE.items)
      text: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })).isRequired,
    name: PropTypes.string, // input name prefix for redux form (ex. `phones.`), defaults to given `kind`
    renderField: PropTypes.func, // function(field, index, onRemove) to render each field, defaults to <InputField/>
    initialValues: PropTypes.object, // used to initiate fields to show at the beginning
    minFields: PropTypes.number, // minimum number of fields to keep before allow removing fields
    addPlaceholder: PropTypes.string, // placeholder for adding fields
    onChange: PropTypes.func, // hook for when fields changes - onChange(fields - in state)
    // ...other props to pass to <Field/> component
  }

  static defaultProps = {
    initialValues: {}
  }

  state = {
    fields: this.fields(), // example: [PHONE.MOBILE]
  }

  fields (props = this.props) {
    return cleanList(Object.keys(props.initialValues).map(_ => findObjByKeys(DEFINITION[props.kind], {_})))
  }

  UNSAFE_componentWillReceiveProps (next) {
    if (!isEqual(next.initialValues, this.props.initialValues))
      this.setState({fields: this.fields(next)})
  }

  handleDeleteField = (name) => {
    const fields = this.state.fields.filter(field => field._ !== name)
    this.setState({fields}, () => {
      // When no fields are left, dispatch action to set parent wrapper field as null to reset on backend,
      // because redux-form persists the deleted field value in state.
      if (!fields.length && this.onChange) this.onChange(null)
      if (this.props.onChange) this.props.onChange(fields, {deleted: {name}})
    })
  }

  handleAddField = (_) => {
    if (!_) return
    const field = findObjByKeys(DEFINITION[this.props.kind], {_})
    this.setState({fields: cleanList(this.state.fields.concat(field))})
    // When new field is added, dispatch action to set value so the form can detect changes from initial values
    // this should be done by defining prop `dispatchChangeOnMount` = true, then let SliderField handle it,
    // because this container does not know which form the field belongs to.
  }

  placeholderInput = ({input}) => {
    this.onChange = input.onChange
    return null
  }

  // RENDERS -------------------------------------------------------------------
  renderField = (obj) => {
    const {name, kind, minFields, fields: __, ...props} = this.props
    const {_} = obj
    const id = name ? `${name}.${_}` : `${kind}.${_}`
    if (!props.readonly && (!minFields || minFields < this.state.fields.length)) {
      props.icon = 'delete'
      props.onClickIcon = () => this.handleDeleteField(_)
    }
    return <InputField key={id} name={id} label={obj.name} {...props}/>
  }

  render () {
    const {name, kind, options, renderField, addPlaceholder, readonly, className, style} = this.props
    const {fields} = this.state
    const renderItem = renderField ? ((obj, i) => renderField(obj, i, this.handleDeleteField)) : this.renderField
    const fieldOptions = options
      .filter(({value}) => value && !fields.find(({_}) => _ === value)) // filter out empty string '' and 0
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
        {name && !fields.length && <Active.Field name={name} component={this.placeholderInput}/>}
        {fields.map(renderItem)}
        {!readonly && !!fieldOptions.length &&
        <Dropdown
          search selection
          value=''
          placeholder={addPlaceholder || `+ Add ${TYPE_BY[kind].name}`}
          onSelect={this.handleAddField}
          options={fieldOptions}
        />}
      </View>
    )
  }
}
