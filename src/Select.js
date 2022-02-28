import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { interpolateString, isFunction, l, localiseTranslation } from 'utils-pack'
import { _ } from 'utils-pack/translations'
import Label from './Label'

/**
 * Select - Pure Component.
 *
 * @param {*} value - selected option value
 * @param {Array} options - list of option values, e.g. ['value']
 * @param {Function} onChange - callback when user selects an option, receives value as argument
 * @param {String} [name] - input name identification for form submission
 * @param {String} [label] - select label
 * @param {String} [id] - to map label with Select for accessibility
 * @param {String} [placeholder] - text
 * @param {String} [defaultValue] - text
 * @param {String} [className] - css class name to apply
 * @param {Object} [style] - css to apply
 * @param {*} [props] - other attributes to pass to `<select>`
 * @returns {Object} - React select component
 */
export function Select ({
  name,
  label = name,
  id = 'select-' + name,
  value = '',
  options,
  onChange,
  placeholder,
  defaultValue = '',
  className,
  style,
  ...props
}) {
  if (typeof options[0] === 'string') options = options.map(value => ({text: value, value}))
  if (typeof options[0] === 'number') options = options.map(value => ({text: String(value), value}))
  if (value && !onChange) throw new Error('Select.value is only used when `onChange` or `readOnly` provided')
  if (label == null) label = ''
  const selectLabel = interpolateString(_.SELECT_option, {option: label})
  return (
    <div className={classNames('select', className)} style={style}>
      <Label htmlFor={id} className="sr-only">{selectLabel}</Label>
      <select
        id={id}
        name={name}
        {...isFunction(onChange) ? {
          value, onChange: (event) => onChange(event.target.value, name, event)
        } : {defaultValue}}
        {...props}
      >
        {(value == null || !!label) &&
        <option value="" disabled>{placeholder || selectLabel}</option>}
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

export default React.memo(Select)

localiseTranslation({
  SELECT_option: {
    [l.ENGLISH]: 'Select {option}',
  },
})
