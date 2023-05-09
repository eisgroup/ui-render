import classNames from 'classnames'
import React, { useState, useEffect } from 'react'
import { capitalize, isString } from 'ui-utils-pack'
import Button from './Button'
import Icon from './Icon'
import Label from './Label'
import Row from './Row'
import Text from './Text'
import View from './View'
import { Active } from 'ui-utils-pack'
import RCInputNumber from 'rc-input-number'

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
 * @param {String|Object} [error] - message to display
 * @param {String|Object} [info] - explanation message to display under input
 * @param {String} [title] - tooltip
 * @param {String} [className] - css class to add
 * @param {String} [classNameIcon] - css class to add to Icon
 * @param {Object} [style] - css styles
 * @param {String|Object} [children] - React component
 * @param {*} props - attributes to pass to `<input />`
 * @returns {Object} - React Component
 */
const InputNumber = ({
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
  float,
  error,
  info,
  style,
  onFocus,
  onBlur,
  onRemove,
  title,
  defaultValue,
  placeholder,
  translate = Active.translate,
  outputFormat = {},
  onChange,
  value: valueFromParent,
  type: _1,
  ...props
}) => {
  const [active, setState] = useState(false)
  const [value, setValue] = useState(valueFromParent)
  let format = (v) => v
  // const [formattedValue, setFormattedValue] = useState()
  if (readonly) {
    props.className = 'readonly'
    props.readOnly = readonly
  } // React fix
  if (float) {
    if (!label && name) label = capitalize(name)
    if (!placeholder) placeholder = ' ' // required for Float label CSS to work
  }
  if (!id && label) id = 'input-' + label.replace(/ +?/g, '-')
  if (!label && title) props.title = translate(title)
  const idHelp = id + '-help'

  const hasValue = typeof value === 'number' && !isNaN(value)
  if (done == null) done = !error && hasValue

  useEffect(() => {
    if (valueFromParent !== value) {
      setValue(valueFromParent)
    }
  }, [valueFromParent])

  const onChangeHandler = (value, name, event) => {
    let nextValue = value
    if (value && outputFormat && outputFormat.decimals) {
      const pattern = `^\\d*(\\.\\d{0,${outputFormat.decimals}})?$`
      const re = new RegExp(pattern, 'g')
      if (!(re.test(value.toString()))) {
        nextValue = parseFloat(value).toFixed(outputFormat.decimals);
      }
    }
    onChange(nextValue, name, event)
    setValue(nextValue)
  }

  function commify(n) {
    var parts = n.toString().split('.');
    const numberPart = parts[0];
    const decimalPart = parts[1];
    const thousands = /\B(?=(\d{3})+(?!\d))/g;
    return numberPart.replace(thousands, ' ') + (decimalPart ? '.' + decimalPart : '');
  }

  format = (value, {userTyping, input}) => {
    if (outputFormat && outputFormat.separateThousands) {
      return commify(value)
    }
    return value
  }

  return (
    <View
      className={classNames('input--wrapper', className, {
        float, done, resize, required: props.required
      })}
      style={style}
    >
      {!float &&
        <Row className="middle">
          {label && <Label htmlFor={id} title={translate(title)}>{translate(label)}</Label>}
          {onRemove && !readonly &&
            <Button className="input__delete" onClick={() => onRemove(name || id)}><Icon name="delete"/></Button>}
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
        {stickyPlaceholder && placeholder && hasValue &&
          <Text className='input__unit' aria-hidden='true'>
            <Text className='invisible no-margin'>{props.value}</Text>{placeholder.substring(props.value.length)}
          </Text>
        }
        <RCInputNumber
          name={name}
          id={id}
          disabled={disabled}
          resize={resize}
          aria-describedby={idHelp}
          placeholder={translate(placeholder)}
          onFocus={(...args) => {
            !active && setState(true)
            onFocus && onFocus(...args)
          }}
          onBlur={(...args) => {
            active && setState(false)
            onBlur && onBlur(...args)
          }}
          onChange={onChangeHandler}
          {...props}
          value={value}
          formatter={format}
        />
        {icon && !lefty && (isString(icon)
            ? <Icon name={icon} onClick={onClickIcon} className={classNameIcon}/>
            : icon
        )}
        {float && label && <Label htmlFor={id} title={translate(title)}>{translate(label)}</Label>}
      </Row>
      {(error || info) &&
        <View id={idHelp} className='field-help'>
          {error && <Text className='error'>{translate(error)}</Text>}
          {info && <Text className='into'>{translate(info)}</Text>}
        </View>
      }
      {children}
    </View>
  )
}

export default InputNumber
