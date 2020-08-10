import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import Label from './Label'
import Row from './Row'
import View from './View'

/**
 * Checkbox - Pure Component
 *
 * @Note: either `id` or `label` must be given
 *
 * @param {String} [label] - text to use for identification, uses `id` if not given
 * @param {String} [id] - will be derived from `label` if not given
 * @param {Function} onChange - callback on value change
 * @param {Boolean|*} value - checked or unchecked state
 * @param {String} [type] - one of ['toggle']
 * @param {Boolean} [defaultValue] - checked or unchecked state
 * @param {String|Object} [labelTrue] - text to show for checked state
 * @param {String|Object} [labelFalse] - text to show for unchecked state
 * @param {*} [valueTrue] - value to assign to true case
 * @param {*} [valueFalse] - value to assign to false case
 * @param {Boolean} [readonly] - input attribute
 * @param {Boolean} [danger] - if true, then unchecked will have red background
 * @param {String} [className] - css class to apply
 * @param {Object} [props] - other props to pass
 * @return {*}
 * @constructor
 */
function Checkbox ({
  value,
  valueTrue = true,
  valueFalse = false,
  defaultValue = false,
  onChange,
  type = 'checkbox',
  label,
  labelTrue,
  labelFalse,
  id,
    readonly,
    danger,
    className,
    float: _, // not used
    initialValues: __, // not used
    ...props
  }) {
  if (readonly) props.readOnly = readonly // React wants `readonly` to be `readOnly`
  labelTrue = labelTrue || 'ON'
  labelFalse = labelFalse || 'OFF'
  if (!id) id = 'checkbox-' + label.replace(/ +?/g, '-')
  if (value === valueTrue) value = true
  if (value === valueFalse) value = false
  props.checked = (value === true || value === false) ? value : defaultValue
  return (
    <Row className={classNames('checkbox--wrapper', className)}>
      <input
        type={type === 'toggle' ? 'checkbox' : type}
        className={classNames('checkbox', type)}
        id={id}
        onChange={({target: {checked}}) => onChange(checked ? valueTrue : valueFalse)}
        {...props}
      />
      <Label
        htmlFor={id}
        className={classNames('flex--row middle justify', {danger})}
      >
        {type === 'toggle'
          ? <Fragment>
            <View className="checkbox__true">{labelTrue}</View>
            <View className="checkbox__button"/>
            <View className="checkbox__false">{labelFalse}</View>
          </Fragment>
          : (label || id)
        }
      </Label>
    </Row>
  )
}

Checkbox.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  labelTrue: PropTypes.any,
  labelFalse: PropTypes.any,
  onChange: PropTypes.func,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  className: PropTypes.string,
}

export default React.memo(Checkbox)
