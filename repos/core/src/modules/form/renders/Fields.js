import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Field } from 'redux-form'
import { cleanList, findObjByKeys, isEmpty, isEqual } from '../../../common/utils'
import { DEFINITION, TYPE_BY } from '../../../common/variables/definitions'
import Dropdown from '../../../components/Dropdown'
import View from '../../../components/View'
import { InputField } from '../inputs'

/**
 * List of Predefined Form Fields with dropdown search input to add and remove them (ex. Languages)
 */
export default class Fields extends Component {
  static propTypes = {
    kind: PropTypes.string.isRequired, // TYPE key (ex. TYPE.PHONE.key)
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

  state = {
    fields: [], // example: [PHONE.MOBILE]
  }

  UNSAFE_componentWillMount () {
    const {initialValues} = this.props
    if (!isEmpty(initialValues)) this.syncState()
  }

  UNSAFE_componentWillReceiveProps (next) {
    if (next.initialValues && !isEqual(next.initialValues, this.props.initialValues)) this.syncState(next)
  }

  syncState = (props = this.props) => {
    const fields = Object.keys(props.initialValues).map(code => findObjByKeys(DEFINITION[this.props.kind], {code}))
    this.setState({fields: cleanList(fields)})
  }

  handleDeleteField = (code) => {
    const fields = this.state.fields.filter(field => field.code !== code)
    this.setState({fields}, () => {
      // When no fields are left, dispatch action to set parent wrapper field as null to reset on backend,
      // because redux-form persists the deleted field value in state.
      if (!fields.length && this.onChange) this.onChange(null)
      if (this.props.onChange) this.props.onChange(fields)
    })
  }

  handleAddField = (code) => {
    if (!code) return
    const field = findObjByKeys(DEFINITION[this.props.kind], {code})
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
    const {code} = obj
    const id = name ? `${name}.${code}` : `${kind}.${code}`
    if (!props.readonly && (!minFields || minFields < this.state.fields.length)) {
      props.icon = 'delete'
      props.onClickIcon = () => this.handleDeleteField(code)
    }
    return <InputField key={id} name={id} label={obj.name} {...props}/>
  }

  render () {
    const {name, kind, options, renderField, addPlaceholder, readonly, className, style} = this.props
    const {fields} = this.state
    const renderItem = renderField ? ((obj, i) => renderField(obj, i, this.handleDeleteField)) : this.renderField
    const fieldOptions = options
      .filter(({value}) => value && !fields.find(({code}) => code === value)) // filter out empty string '' and 0
    return (
      <View className={classNames('app__fields min-width-290', className)} style={style}>
        {/*
        Only register placeholder parent field when there are no fields left (to reset on backend)
        because if registered when there are existing fields, withForm's  this.changedValues grabs all values within it,
        and will make deleting fields impossible.
        */}
        {name && !fields.length && <Field name={name} component={this.placeholderInput}/>}
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
