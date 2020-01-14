import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { isFunction } from '../common/utils'
import Label from './Label'

/**
 * Select - Pure Component.
 *
 * @param {*} value - selected option value
 * @param {Array} options - list of option values, e.g. ['value']
 * @param {Function} onChange - callback when user selects an option, receives value as argument
 * @param {String} [name] - input name identification for form submission
 * @param {String} [label] - select label
 * @param {String} [placeholder] - text
 * @param {String} [defaultValue] - text
 * @param {String} [className] - css class name to apply
 * @param {*} [props] - other attributes to pass to `<select>`
 * @returns {Object} - React select component
 */
export default function Select
  ({
     name,
     label = name,
     value = '',
     options,
     onChange,
     placeholder,
     defaultValue = '',
     className,
   }) {
  const id = 'select-' + label
  if (typeof options[0] === 'string') options = options.map(value => ({ text: value, value }))
  if (typeof options[0] === 'number') options = options.map(value => ({ text: String(value), value }))
  return (
    <div className={classNames('select', className)}>
      <Label htmlFor={id} className="sr-only">Select {label}</Label>
      <select
        id={id}
        name={name}
        {...isFunction(onChange) ? {value, onChange: ({target: {value}}) => onChange(value)} : {defaultValue}}
      >
        <option value='' disabled>{placeholder || 'Select ' + (label ? label : '')}</option>
        {options.map(({text, value, key}, index) => (
          <option key={key || index} value={value != null ? value : text}>{text}</option>
        ))}
      </select>
    </div>
  )
}

Select.propTypes = {
  value: PropTypes.any,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
      text: PropTypes.any.isRequired,
      value: PropTypes.any,
      key: PropTypes.any,
    })
  ])).isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.any
}

Select.Class = class extends Component {
  render () {
    return <Select {...this.props} />
  }
}

