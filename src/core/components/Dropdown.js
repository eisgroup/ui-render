import classNames from '../utils/classNames'
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
} from '../utils'
import { _ } from '../utils/translations'
import Icon from './Icon'
import Text from './Text'
import View from './View'
import { Active } from '../utils'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

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
  const isInitialMount = useRef(true)
  const tempValue = useRef()

  useEffect(() => {
    !isEqual(options, opts) && setOptions(opts)
    // `options` is read only as an equality guard against a redundant setState. Listing it as a dependency
    // would re-run this sync after every options change, including the one it just performed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts])

  // Sync internal value with parent prop.
  // Skip on initial mount when valueFromParent is undefined to preserve defaultValue (first option).
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      if (typeof valueFromParent === 'undefined') return
    }
    setValue(valueFromParent == null || valueFromParent === '' ? null : valueFromParent)
  }, [valueFromParent])

  // Reset value when options change and current value is no longer valid (e.g., cascading Select).
  //
  // @Note: TWO defects here, both found by the §9.7-F1 step 3 part 1 audit and both about what the
  //  HOST is told rather than what is displayed.
  //  (1) The reset used to emit `String(...)` of the option value, with arity 1 — so a host whose
  //      options carry numbers was told to select `'7'` where the option is `7`, and a host
  //      matching with `===` missed it. The values are now kept unstringified (the stringified
  //      copy remains, but only as the comparison key it always was), and the call carries the
  //      `(value, name, event)` signature the wrapper documents. There is no event for a
  //      programmatic reset, so the third argument is genuinely absent rather than faked.
  //  (2) The guard did not cover an EMPTY ARRAY. `String([])` is `''`, which is never in the
  //      option keys, so a `multiple` dropdown mounted with `value={[]}` was reset immediately:
  //      `onChange(firstOption)` before the user touched anything, a selection they never made.
  const validOptions = (Array.isArray(opts) ? opts : []).map(o => (
    (typeof o === 'string' || typeof o === 'number') ? o : (o.value != null ? o.value : o.text)
  ))
  const validOptionValues = validOptions.map(String)
  const optionValuesKey = validOptionValues.join('\n')
  const hasNoValue = value => value == null || value === '' || (Array.isArray(value) && !value.length)
  useEffect(() => {
    if (!onChange || !validOptionValues.length) return
    if (hasNoValue(valueFromParent)) return
    if (!validOptionValues.includes(String(valueFromParent))) {
      onChange(validOptions[0], props.name)
    }
  }, [optionValuesKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (autofocus) props.searchInput = {autoFocus: true} // better to disable autofocus for usability - why?
  if (readonly) props.disabled = true // Semantic Dropdown does not accept `readOnly` prop
  if (props.selection == null) props.selection = true
  if (props.search && props.deburr == null) props.deburr = true // Case and diacritics insensitive search

  // @Note: the comment below used to claim `undefined` options "pass through unchanged". They did
  //  not — `options[0]` on an absent or null list THREW, measured:
  //  `Cannot read properties of undefined (reading '0')` for a bare `{view: 'Dropdown', name: 'x'}`,
  //  and the same for null (which a `name`-bound data path can produce). Only `options: []` ever
  //  rendered. An empty select is a legitimate state — options not loaded yet, or a genuinely
  //  empty list — so absent and null are now that state instead of a thrown error the engine
  //  replaces the whole node with. Found by the §9.7-F1 step 3 part 1 audit.
  if (options == null) options = []

  // Sanitize. Any other typeof — boolean, function — passes through unchanged; the bare
  // `no default` comment below is the escape hatch eslint-config-react-app's `default-case` wants.
  switch (typeof options[0]) {
    case 'string':
      options = options.map(value => ({text: translate(value), value}))
      break
    case 'number':
      options = options.map(value => ({text: String(value), value}))
      break
    case 'object':
      // `typeof null === 'object'`, so null must be excluded here or it lands in the array branch below and
      // becomes the string "null".
      if (options[0].value !== null && typeof options[0].value === 'object') { // value is an array (ex. Color)
        options = options.map(({ value, text, ...option }) => ({ value: String(value), text: translate(text), ...option }))
      } else if (typeof options[0].value === 'string') {
        options = options.map(({ value, text, ...option }) => ({ value: value, text: translate(text), ...option }))
      } else if (options[0].value == null) {
        // An option with no value takes its text as the value. The cascading-reset effect above already
        // treats text as that option's value, and the two must agree — otherwise the value it asks the
        // parent to select can never equal the value the option carries, and nothing appears selected.
        options = options.map(({ value, text, ...option }) => ({ value: value != null ? value : text, text: translate(text), ...option }))
      }
      break
    // no default
  }
  // @Note: kept BEFORE the label is appended, because `onAddItem` writes the option list back into
  //  state — and it used to write back the label-appended copy, so every addition appended the
  //  label again. Measured menu after one addition: ['Zed','Option A','Option B','FOOTER','FOOTER'].
  //  Found by the §9.7-F1 step 3 part 1 audit.
  const optionsWithoutLabel = options
  if (optionsLabel) options = [...options, {key: '', text: '', content: optionsLabel, disabled: true}]

  // Convert Icon to Node because Semantic has no `onClickIcon` callback
  // Only when there is help text to point at, so no `aria-describedby` in this product ever dangles.
  const helpId = (props.id && (error || info)) ? `${props.id}-help` : undefined

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
      tempValue.current = (props.multiple && !isObject(last(value))) ? toUniqueListCaseInsensitive(value.reverse()).reverse() : value
      setValue(tempValue.current)
      onChange && onChange(tempValue.current, props.name, event)
    }
  }

  if (onSelect) props.onClose = (event) => onSelect(tempValue.current, props.name, event)
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
        setOptions([newOption, ...optionsWithoutLabel])
        onAddItem && onAddItem(value, props.name, event)
      }
    }
  }

  // Sanitize Value (for Colors)
  let dropdownValue = value
  if (Array.isArray(dropdownValue) && dropdownValue.length) {
    if (!props.multiple) dropdownValue = dropdownValue.join(',')
    if (props.multiple && Array.isArray(dropdownValue[0])) dropdownValue = dropdownValue.map(v => v.join(','))
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
        aria-describedby={helpId}
        className={classNames({info, readonly})}
        options={options}
        placeholder={translate(placeholder)}
        error={!!error}
        lazyLoad={lazyLoad}
        noResultsMessage={(hasListValue(dropdownValue) && dropdownValue.length === options.length) ? _.NO_OPTIONS_LEFT : _.NOTHING_FOUND}
        value={dropdownValue}
        // DOM boundary: Semantic's Dropdown spreads whatever it does not recognise (and it
        // declares no `name`) onto its <div role="listbox">, so engine props and `name`/`label`
        // became attributes there. Filtered here, AFTER the props.onClose/onSearchChange/
        // onAddItem assignments above, and without touching the `props.name` those handlers
        // report to the host. See ./domProps.js.
        {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)}
      />
      {label && float && <Text className="input__label">{translate(label)}</Text>}
      {(error || info) &&
      /*
       * `${id}-help`, not `id`. The caller's `id` also rides the rest bag onto Semantic's
       * `<div role="listbox">`, so this View used to give TWO elements the same id — invalid, and
       * reachable without the caller doing anything, because `mapper.js` assigns `input.id`
       * automatically for relative paths. The derived id is also what `aria-describedby` on the
       * control now points at: the error and info text was rendered but never announced.
       * Found by the §9.7-F1 step 3 part 1 audit.
       */
      <View id={helpId} className="field-help">
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
