import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown as DropDown } from 'semantic-ui-react' // adds 27 KB to final js bundle
import { hasListValue } from '../common/utils'
import { _ } from '../common/variables'
import Text from './Text'
import View from './View'

/**
 * Drop Down Select - Pure Component.
 *
 * @Note: for docs, check out https://react.semantic-ui.com/modules/dropdown/
 *
 * @example:
 *  <Dropdown
 *    label="Snap"
 *    value={0.1}
 *    options={[0.1, 0.2, 0.3]}
 *    className="inline-block"
 *  />
 *
 * @param {*} value - selected option value
 * @param {Array} options - list of option values, e.g. ['value']
 * @param {Function} [onChange] - callback when user changes input value, receives value as argument
 * @param {Function} [onSelect] - callback when user selects an option, receives value as argument
 * @param {Function} [onSearch] - callback when user types in the input, receives value as argument
 * @param {String} [label] - text to display next to input
 * @param {String} [placeholder] - text
 * @param {Boolean} [done] - whether input is completed
 * @param {String|Object} [error] - message to display
 * @param {String|Object} [info] - explanation message to display under input
 * @param {Boolean} [float] - whether display as float-label input
 * @param {Boolean} [readonly] - whether to disable input and add `readonly` css class
 * @param {String} [className] - css class to add
 * @param {Object} [style] - css styles to add
 * @param {Boolean} [fill] - whether to fill available width
 * @param {Boolean} [lazyLoad] - whether to defer rendering options until opened, default is true
 * @param {*} [optionsLabel] - extra label for dropdown options on the bottom
 * @param {*} [props] - other attributes to pass to `<select>`
 * @returns {Object}
 */
export default function Dropdown
  ({
    options,
    onChange,
    onSelect,
    onSearch,
    label,
    placeholder = _.SELECT,
    done,
    error,
    info,
    float,
    className,
    style,
    fill = true,
    lazyLoad = true,
    optionsLabel,
    initialValues, // not used, removing from DOM
    readonly,
    autofocus,
    ...props
  }) {
  // if (autofocus) props.searchInput = {autoFocus: true} // better to disable autofocus for usability
  if (readonly) props.disabled = true // Semantic Dropdown does not accept `readOnly` prop
  if (onChange || onSelect) props.onChange = (event, data) => {
    tempValue = data.value // store value temporarily for onSelect event
    onChange && onChange(data.value, event)
  }
  if (onSelect) props.onClose = (event) => onSelect(tempValue, event)
  if (onSearch) props.onSearchChange = (event, data) => onSearch(data.searchQuery, event)
  // Always include existing value to avoid having a hidden selection because it's no longer in available options
  // if (props.value != null) {
  // if (typeof options[0] === 'object') {
  //   if (!options.find(({ value }) => props.value === value)) options = options.concat({
  //     text: props.value,
  //     value: props.value
  //   })
  // } else {
  //   if (!isInList(options, props.value)) options = options.concat(props.value)
  // }
  // }

  /* Sanitize Options */
  if (typeof options[0] === 'string') options = options.map(value => ({text: value, value}))
  if (typeof options[0] === 'number') options = options.map(value => ({text: String(value), value}))
  if (typeof options[0] === 'object' && typeof options[0].value === 'object') // value is an array (ex. Color)
    options = options.map(({value, ...option}) => ({value: String(value), ...option}))

  if (optionsLabel) options = [...options, {key: '', text: '', content: optionsLabel, disabled: true}]

  if (props.selection == null) props.selection = true

  /* Sanitize Value (for Colors) */
  if (props.value && props.value.constructor === Array && props.value.length) {
    if (!props.multiple) props.value = props.value.join(',')
    if (props.multiple && props.value[0].constructor === Array) props.value = props.value.map(v => v.join(','))
  }

  /* Error handling */
  if (hasListValue(props.value) && props.value.length === options.length) props.noResultsMessage = _.NO_OPTIONS_LEFT
  if (done == null) done = !error && (props.multiple ? hasListValue(props.value) : (!!props.value || props.value === 0))

  return (
    <View className={classNames('input--wrapper', {
      float, done, labeled: label, 'fill-width': !props.compact && fill,
    }, className)} style={style}>
      <DropDown
        className={classNames({info, readonly})}
        options={options}
        placeholder={placeholder}
        error={!!error}
        lazyLoad={lazyLoad}
        {...props}
      />
      {label && <Text className='input__label'>{label + (props.required ? '*' : '')}</Text>}
      {(error || info) &&
      <View id={props.id} className='field-help'>
        {error && <Text className='error'>{error}</Text>}
        {info && <Text className='into'>{info}</Text>}
      </View>
      }
    </View>
  )
}

Dropdown.propTypes = {
  value: PropTypes.any,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
      text: PropTypes.any.isRequired,
      value: PropTypes.any,
      key: PropTypes.any
    })
  ])).isRequired,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.any
}

let tempValue
