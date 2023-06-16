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
  outputFormat = {
    percentage: false,
    separateThousands: false,
  },
  onChange,
  value: valueFromParent,
  type: _1,
  ...props
}) => {
  const [active, setState] = useState(false)
  const [value, setValue] = useState(valueFromParent)
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

  const format = (value, {userTyping, input}) => {
    if (outputFormat) {
      if (outputFormat.percentage) {
        return value + ' %'
      }
      if (outputFormat.separateThousands) {
        return commify(value)
      }
    }

    return value
  }

  const parser = (value) => {
    if (outputFormat) {
      if (outputFormat.percentage) {
        return Number(value.replace(' %', ''))
      }
    }
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
          parser={parser}
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
