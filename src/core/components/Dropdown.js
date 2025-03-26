import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { Dropdown as DropDown } from 'semantic-ui-react' // adds 27 KB to final js bundle
import {
  hasListValue,
  isEqual,
  isObject,
  isString,
  l,
  last,
  localiseTranslation,
  toLowerCase,
  toLowerCaseAny,
  toUniqueListCaseInsensitive,
  trimSpaces
} from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import Icon from './Icon'
import Text from './Text'
import View from './View'
import { Active } from 'ui-utils-pack'

localiseTranslation({
  ADD_: {
    [l.ENGLISH]: 'Add ',
  },
  NOTHING_FOUND: {
    [l.ENGLISH]: 'Nothing found',
  },
  NO_OPTIONS_LEFT: {
    [l.ENGLISH]: 'No options left',
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
  translate = Active.translate,
  value: valueFromParent,
  ...props
}) {
  // Store options as state to allow additions
  let [options, setOptions] = useState(opts)
  const defaultValue = useRef(typeof valueFromParent !== 'undefined'
    ? valueFromParent
    : ((Array.isArray(opts) && opts[0] && opts[0].value) || undefined)
  )
  const [value, setValue] = useState(defaultValue.current)
  let tempValue

  useEffect(() => {
    !isEqual(options, opts) && setOptions(opts)
  }, [opts])

  useEffect(() => {
    setValue(valueFromParent || null)
  }, [valueFromParent])

  useEffect(() => {
    setValue(defaultValue.current)
  }, [])

  if (autofocus) props.searchInput = {autoFocus: true} // better to disable autofocus for usability - why?
  if (readonly) props.disabled = true // Semantic Dropdown does not accept `readOnly` prop
  if (props.selection == null) props.selection = true
  if (props.search && props.deburr == null) props.deburr = true // Case and diacritics insensitive search

  // Sanitize
  switch (typeof options[0]) {
    case 'string':
      options = options.map(value => ({text: translate(value), value}))
      break
    case 'number':
      options = options.map(value => ({text: String(value), value}))
      break
    case 'object':
      if (typeof options[0].value === 'object') { // value is an array (ex. Color)
        options = options.map(({ value, text, ...option }) => ({ value: String(value), text: translate(text), ...option }))
      } else if (typeof options[0].value === 'string') {
        options = options.map(({ value, text, ...option }) => ({ value: value, text: translate(text), ...option }))
      }
      break
  }
  if (optionsLabel) options = [...options, {key: '', text: '', content: optionsLabel, disabled: true}]

  // Convert Icon to Node because Semantic has no `onClickIcon` callback
  if (onClickIcon) props.icon = <Icon name={props.icon || 'dropdown'} onClick={onClickIcon} className={classNameIcon}/>

  // On Change gets called before `onAddItem`
  if (onChange || onSelect) {
    props.onChange = (event, {value}) => {
      // Since there is no option to disable addition when search matches existing options (case-insensitive),
      // => sanitize onChange to have value from existing options.
      // @note: it's possible to temporarily disable addition, but that logic is more complex,
      //    and shows 'No options left' message, instead of 'Add value',
      //    which may be more intuitive, because it simply moves the selected value to the end.
      let val = props.multiple ? last(value) : value
      if (val && isString(val)) {
        val = trimSpaces(val).toLowerCase()
        const duplicate = options.find(({text}) => typeof text === 'string' && toLowerCase(text) === val)
        if (duplicate && toLowerCaseAny(duplicate.value) !== val) {
          if (props.multiple) {
            value[value.length - 1] = duplicate.value
          } else {
            value = duplicate.value
          }
        }
      }

      // Remove duplicates for non-matching cases, or value converted to Id from the operation above.
      // Keep the last entered value for new additions.
      // @Note: the list of values can be a mix of primitive Number and String
      // Store value temporarily for onSelect event.
      tempValue = (props.multiple && !isObject(last(value))) ? toUniqueListCaseInsensitive(value.reverse()).reverse() : value
      setValue(value)
      onChange && onChange(tempValue, props.name, event)
    }
  }

  if (onSelect) props.onClose = (event) => onSelect(tempValue, props.name, event)
  if (onSearch) props.onSearchChange = (event, data) => onSearch(data.searchQuery, props.name, event)

  // Sanitize options from duplicates on addition
  if (props.allowAdditions) {
    if (props.additionLabel == null) props.additionLabel = _.ADD_
    if (!props.upward && props.additionPosition == null) props.additionPosition = 'bottom'

    // This may add duplicate item for non-matching cases
    props.onAddItem = (event, {value}) => {
      value = trimSpaces(value)
      const val = toLowerCase(value)
      // The duplicate can be exiting options, or a newly added option
      const duplicate = options.find(({text}) => toLowerCase(text) === val)
      const newOption = {text: value, value} // `options` is always a list of objects because of sanitization below
      if (duplicate) {
        // Override only newly added duplicate option to match the last case entered
        if (toLowerCaseAny(duplicate.value) === val) Object.assign(duplicate, newOption)
      } else {
        setOptions([newOption, ...options])
        onAddItem && onAddItem(value, props.name, event)
      }
    }
  }

  // Sanitize Value (for Colors)
  if (props.value && props.value.constructor === Array && props.value.length) {
    if (!props.multiple) props.value = props.value.join(',')
    if (props.multiple && props.value[0].constructor === Array) props.value = props.value.map(v => v.join(','))
  }

  /// Error handling
  // @Note: below logic only works as DropdownField with controlled value
  if (done == null) done = !error && (props.multiple ? hasListValue(props.value) : (!!props.value || props.value === 0))

  return (
    <View className={classNames('input--wrapper', {
      float, done, labeled: label, 'fill-width': !props.compact && fill, required: props.required,
    }, className)} style={style}>
      {label && !float && <Text className="input__label">{translate(label)}</Text>}
      <DropDown
        className={classNames({info, readonly})}
        options={options}
        placeholder={translate(placeholder)}
        error={!!error}
        lazyLoad={lazyLoad}
        noResultsMessage={(hasListValue(props.value) && props.value.length === options.length) ? _.NO_OPTIONS_LEFT : _.NOTHING_FOUND}
        value={value}
        {...props}
      />
      {label && float && <Text className="input__label">{translate(label)}</Text>}
      {(error || info) &&
      <View id={props.id} className="field-help">
        {error && <Text className="error">{translate(error)}</Text>}
        {info && <Text className="into">{translate(info)}</Text>}
      </View>
      }
    </View>
  )
}

Dropdown.displayName = 'Dropdown'

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

export default React.memo(Dropdown)
