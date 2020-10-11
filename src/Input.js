import classNames from 'classnames'
import React, { useState } from 'react'
import { capitalize, isString } from 'utils-pack'
import Button from './Button'
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
 * @param {String} [name] - input name attribute
 * @param {String|Object|Boolean} [icon] - name or rendered component, rendered after input by default
 * @param {Boolean} [lefty] - whether to render icon on the left before input
 * @param {Function} [onClickIcon] - callback function when clicking on the icon if given
 * @param {Function} [onFocus] - callback when input gets focus
 * @param {Function} [onBlur] - callback when input loses focus
 * @param {Function} [onRemove] - callback(id || name) when input is deleted
 * @param {String} [unit] - text to display next to entered input value
 * @param {String} [label] - text to display next to input
 * @param {String} [id] - unique identifier for label
 * @param {Boolean} [float] - whether display as float-label input
 * @param {Boolean} [disabled] - whether input is disabled
 * @param {Boolean} [done] - whether input is completed
 * @param {Boolean} [stickyPlaceholder] - whether to persist placeholder as user types
 * @param {Boolean} [resize] - whether to adjust input height to match typed in text
 * @param {Boolean} [readonly] - whether to disable input and add `readonly` css class
 * @param {Boolean} [autofocus] - whether to make input focused on page load
 * @param {String|Object} [error] - message to display
 * @param {String|Object} [info] - explanation message to display under input
 * @param {String} [className] - css class to add
 * @param {String} [classNameIcon] - css class to add to Icon
 * @param {Object} [style] - css styles
 * @param {String|Object} [children] - React component
 * @param {*} props - attributes to pass to `<input />`
 * @returns {Object} - React Component
 */
export function Input ({
  name,
  id = name,
  icon,
  lefty,
  onClickIcon,
  unit,
  label,
  disabled,
  done,
  className,
  classNameIcon,
  children,
  stickyPlaceholder, // only works with controlled component when `props.value` is provided
  resize,
  readonly,
  autofocus,
  float,
  error,
  info,
  style,
  onFocus,
  onBlur,
  onRemove,
  ...props
}) {
  const [active, setState] = useState(props.autoFocus)
  if (autofocus) props.autoFocus = autofocus // React fix
  if (readonly) {
    props.className = 'readonly'
    props.readOnly = readonly
  } // React fix
  if (props.type === 'hidden') return <InputNative {...props} />
  if (float) {
    if (!label && name) label = capitalize(name)
    if (!props.placeholder) props.placeholder = ' ' // required for Float label CSS to work
  }
  if (!id && label) id = 'input-' + label.replace(/ +?/g, '-')
  const idHelp = id + '-help'
  const value = props.value != null ? props.value : props.defaultValue
  const hasValue = value || value === 0
  const isCheckbox = props.type === 'checkbox'
  if (done == null) done = !error && hasValue
  return (
    <View
      className={classNames('input--wrapper', className, {float, done, resize, swatch: props.type === 'color'})}
      style={style}
    >
      {!float &&
      <Row className='middle'>
        {!isCheckbox && label && <Label htmlFor={id}>{label + (props.required ? '*' : '')}</Label>}
        {onRemove && !readonly &&
        <Button className='input__delete' onClick={() => onRemove(id)}><Icon name='delete'/></Button>}
      </Row>
      }
      <Row className={classNames('input', {active, icon, lefty, error, info, unit})}>
        {icon && lefty && (isString(icon)
            ? <Icon name={icon} onClick={onClickIcon} className={classNameIcon}/>
            : icon
        )}
        {unit && hasValue &&
        <Text className='input__unit truncate'>
          <Text className='invisible' aria-hidden='true'>{value}</Text> {unit}
        </Text>
        }
        {stickyPlaceholder && props.placeholder && hasValue &&
        <Text className='input__unit' aria-hidden='true'>
          <Text className='invisible no-margin'>{props.value}</Text>{props.placeholder.substring(props.value.length)}
        </Text>
        }
        <InputNative
          name={name} id={id} disabled={disabled} resize={resize} aria-describedby={idHelp}
          onFocus={(...args) => {
            !active && setState(true)
            onFocus && onFocus(...args)
          }}
          onBlur={(...args) => {
            active && setState(false)
            onBlur && onBlur(...args)
          }}
          {...props}
        />
        {icon && !lefty && (isString(icon)
            ? <Icon name={icon} onClick={onClickIcon} className={classNameIcon}/>
            : icon
        )}
        {(float || isCheckbox) && label && <Label htmlFor={id}>{label + (props.required ? '*' : '')}</Label>}
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

export default React.memo(Input)
