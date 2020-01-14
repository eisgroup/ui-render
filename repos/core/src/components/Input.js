import classNames from 'classnames'
import React from 'react'
import { capitalize } from '../common/utils'
import Icon from './Icon'
import InputNative from './InputNative'
import Label from './Label'
import Row from './Row'
import Text from './Text'
import View from './View'

/**
 * Input Wrapper - Pure Component.
 * @Note: see `InputNative` component for more documentation
 *
 * @param {String} [icon] - name, rendered after input by default
 * @param {Boolean} [left] - to render icon before input
 * @param {Function} [onClickIcon] - callback function when clicking on the icon if given
 * @param {String} [unit] - text to display next to entered input value
 * @param {String} [label] - text to display next to input
 * @param {String} [id] - unique identifier for label
 * @param {Boolean} [float] - whether display as float-label input
 * @param {Boolean} [disabled] - whether input is disabled
 * @param {Boolean} [done] - whether input is completed
 * @param {Boolean} [stickyPlaceholder] - whether to persist placeholder as user types
 * @param {Boolean} [resize] - whether to adjust input height to match typed in text
 * @param {Boolean} [readOnly] - whether to disable input and add `readOnly` css class
 * @param {String|Object} [error] - message to display
 * @param {String|Object} [info] - explanation message to display under input
 * @param {String} [className] - css class to add
 * @param {Object} [style] - css styles
 * @param {String|Object} [children] - React component
 * @param {*} props - attributes to pass to `<input />`
 * @returns {Object} - React Component
 */
export default function Input
  ({
    icon,
    left,
    onClickIcon,
    unit,
    label,
    id,
    disabled,
    done,
    className,
    children,
    stickyPlaceholder, // only works with controlled component when `props.value` is provided
    resize,
    readOnly,
    float,
    error,
    info,
    style,
    ...props
  }) {
  if (readOnly) disabled = true
  if (props.type === 'hidden') return <InputNative {...props} />
  if (float || label) {
    if (!label) label = capitalize(props.name)
    if (!id) id = 'input-' + label.replace(/ +?/g, '-')
  }
  if (float && !props.placeholder) props.placeholder = ' ' // required for Float label CSS to work
  const idHelp = id + '-help'
  const hasValue = props.value != null && props.value !== ''
  if (done == null) done = !error && hasValue
  return (
    <View className={classNames('input--wrapper', className, {float, done, resize, readOnly})} style={style}>
      {!float && label && <Label htmlFor={id}>{label + (props.required ? '*' : '')}</Label>}
      <Row className={classNames('input', {icon, left, disabled, error})}>
        {icon && left && <Icon name={icon} onClick={onClickIcon}/>}
        {unit && hasValue &&
        <Text className='input__unit truncate'>
          <Text className='invisible' aria-hidden='true'>{props.value}</Text> {unit}
        </Text>
        }
        {stickyPlaceholder && props.placeholder && hasValue &&
        <Text className='input__unit' aria-hidden='true'>
          <Text className='invisible no-margin'>{props.value}</Text>{props.placeholder.substring(props.value.length)}
        </Text>
        }
        <InputNative id={id} disabled={disabled} resize={resize} aria-describedby={idHelp} {...props} />
        {icon && !left && <Icon name={icon} onClick={onClickIcon}/>}
        {float && label && <Label htmlFor={id}>{label + (props.required ? '*' : '')}</Label>}
      </Row>
      {(error || info) &&
      <View id={idHelp} className='field-help'>
        {error && <Text className='error'>{error}</Text>}
        {info && <Text className='into'>{info}</Text>}
      </View>
      }
      {/* Reserved for Tooltip or other things */}
      {children}
    </View>
  )
}
