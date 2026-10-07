import classNames from '../utils/classNames'
import React from 'react'
import { interpolateString, isFunction, l, localiseTranslation } from '../utils'
import { _ } from '../utils/translations'
import Label from './Label'

/** An option as `Select` renders it; a plain string or number is an option whose text is its value. */
export type SelectOptionObject = { text: React.ReactNode, value?: unknown, key?: React.Key }
export type SelectOption = string | number | SelectOptionObject

/** The props documented on `Select` below; the rest is spread onto the `<select>`. */
export type SelectProps = {
  value?: unknown
  options: SelectOption[]
  onChange?: (value: string, name: string | undefined, event: React.ChangeEvent<HTMLSelectElement>) => void
  name?: string
  label?: string
  id?: string
  placeholder?: React.ReactNode
  defaultValue?: string
  className?: string
  style?: React.CSSProperties
  [key: string]: unknown
}

/** What the DOM accepts as a `<select>` or `<option>` value. */
type DomValue = React.SelectHTMLAttributes<HTMLSelectElement>['value']

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
function Select ({
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
}: SelectProps) {
  // Casts: the first option's type is taken as every option's, as it was.
  if (typeof options[0] === 'string') options = (options as string[]).map(value => ({text: value, value}))
  if (typeof options[0] === 'number') options = (options as number[]).map(value => ({text: String(value), value}))
  if (value && !onChange) throw new Error('Select.value is only used when `onChange` or `readOnly` provided')
  const accessibleLabel = label || name || 'option'
  if (label == null) label = ''
  const selectLabel = interpolateString(_.SELECT_option, {option: accessibleLabel})
  return (
    <div className={classNames('select', className)} style={style}>
      <Label htmlFor={id} className="sr-only">{selectLabel}</Label>
      <select
        id={id}
        name={name}
        {...isFunction(onChange) ? {
          value: value as DomValue,
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value, name, event)
        } : {defaultValue}}
        {...props}
      >
        {(value == null || !!label) &&
        <option value="" disabled>{placeholder || selectLabel}</option>}
        {(options as SelectOptionObject[]).map(({text, value, key}, index) => (
          <option key={key || index} value={(value != null ? value : text) as DomValue}>{text}</option>
        ))}
      </select>
    </div>
  )
}

export default React.memo(Select)

localiseTranslation({
  SELECT_option: {
    [l.ENGLISH]: 'Select {option}',
  },
})
