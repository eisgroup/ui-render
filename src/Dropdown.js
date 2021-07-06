import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { Dropdown as DropDown } from 'semantic-ui-react' // adds 27 KB to final js bundle
import {
  hasListValue,
  isList,
  isString,
  l,
  last,
  localiseTranslation,
  toLowerCase,
  toUniqueListCaseInsensitive
} from 'utils-pack'
import { _ } from 'utils-pack/translations'
import Icon from './Icon'
import Text from './Text'
import View from './View'

localiseTranslation({
  ADD_: {
    [l.ENGLISH]: 'Add ',
    // [l.RUSSIAN]: 'Добавить ',
  },
  NOTHING_FOUND: {
    [l.ENGLISH]: 'Nothing found',
    // [l.RUSSIAN]: 'Ничего не найдено',
  },
  NO_OPTIONS_LEFT: {
    [l.ENGLISH]: 'No options left',
    // [l.RUSSIAN]: 'Больше нет выборов',
  }
})

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
 * @param {Function} [onAddItem] - callback when user adds new options, must enable `allowAdditions: true`
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
export function Dropdown ({
  options: opts,
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
  classNameIcon,
  style,
  fill = true,
  lazyLoad = true,
  optionsLabel,
  initialValues, // not used, removing from DOM
  readonly,
  autofocus,
  onAddItem,
  onClickIcon,
  ...props
}) {
  // Store options as state to allow additions
  let [options, setOptions] = useState(opts)
  useEffect(() => {options !== opts && setOptions(opts)}, [opts])

  // Convert Icon to Node because Semantic has no `onClickIcon` callback
  if (onClickIcon) {
    props.icon = <Icon name={props.icon || 'dropdown'} onClick={onClickIcon} className={classNameIcon}/>
  }

  // Case and diacritics insensitive search
  if (props.search && props.deburr == null) props.deburr = true

  // Sanitize options from duplicates on addition
  if (props.allowAdditions) {
    if (!props.upward && props.additionPosition == null) props.additionPosition = 'bottom'
    // This may add duplicate item for non-matching cases
    props.onAddItem = (event, {value}) => {
      const val = toLowerCase(value)
      // The duplicate can be exiting options, or a newly added option
      const duplicate = options.find(({text}) => toLowerCase(text) === val)
      const newOption = {text: value, value} // `options` is always a list of objects because of sanitization below
      if (duplicate) {
        // Override only newly added duplicate option to match the last case entered
        if (toLowerCase(duplicate.value) === val) Object.assign(duplicate, newOption)
      } else {
        setOptions([newOption, ...options])
        onAddItem && onAddItem(value, event)
      }
    }
    if (props.additionLabel == null) props.additionLabel = _.ADD_
  }

  if (autofocus) props.searchInput = {autoFocus: true} // better to disable autofocus for usability - why?
  if (readonly) props.disabled = true // Semantic Dropdown does not accept `readOnly` prop
  if (onChange || onSelect) props.onChange = (event, {value}) => {
    // Sanitize value for `allowAdditions`, because it adds duplicates for non-matching cases.
    // Keep the last entered value.
    // @Note: the list of values can be a mix of primitive Number and String
    // Store value temporarily for onSelect event.
    tempValue = (isList(value) && isString(last(value))) ? toUniqueListCaseInsensitive(value.reverse()).reverse() : value
    onChange && onChange(tempValue, event)
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
  switch (typeof options[0]) {
    case 'string':
      options = options.map(value => ({text: value, value}))
      break
    case 'number':
      options = options.map(value => ({text: String(value), value}))
      break
    case 'object':
      if (typeof options[0].value === 'object')  // value is an array (ex. Color)
        options = options.map(({value, ...option}) => ({value: String(value), ...option}))
      break
  }

  if (optionsLabel) options = [...options, {key: '', text: '', content: optionsLabel, disabled: true}]

  if (props.selection == null) props.selection = true

  /* Sanitize Value (for Colors) */
  if (props.value && props.value.constructor === Array && props.value.length) {
    if (!props.multiple) props.value = props.value.join(',')
    if (props.multiple && props.value[0].constructor === Array) props.value = props.value.map(v => v.join(','))
  }

  /* Error handling */
  // @Note: below logic only works as DropdownField with controlled value
  if (done == null) done = !error && (props.multiple ? hasListValue(props.value) : (!!props.value || props.value === 0))

  return (
    <View className={classNames('input--wrapper', {
      float, done, labeled: label, 'fill-width': !props.compact && fill, required: props.required,
    }, className)} style={style}>
      {label && !float && <Text className="input__label">{label}</Text>}
      <DropDown
        className={classNames({info, readonly})}
        options={options}
        placeholder={placeholder}
        error={!!error}
        lazyLoad={lazyLoad}
        noResultsMessage={(hasListValue(props.value) && props.value.length === options.length) ? _.NO_OPTIONS_LEFT : _.NOTHING_FOUND}
        {...props}
      />
      {label && float && <Text className="input__label">{label}</Text>}
      {(error || info) &&
      <View id={props.id} className="field-help">
        {error && <Text className="error">{error}</Text>}
        {info && <Text className="into">{info}</Text>}
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
  onAddItem: PropTypes.func,
  placeholder: PropTypes.any
}

let tempValue

export default React.memo(Dropdown)
