import classNames from '../utils/classNames'
import React, { Fragment, useRef } from 'react'
import Label from './Label'
import Row from './Row'
import View from './View'
import { Active } from '../utils'
import type { Translate } from '../utils/_envs'
import { ENGINE_PROPS, omitProps } from './domProps'
import { useOwnId } from './useOwnId'

/** Called with `valueTrue` or `valueFalse`, the `name` prop, and the change event. */
export type CheckboxChangeHandler = (
  value: unknown,
  name: string | undefined,
  event: React.ChangeEvent<HTMLInputElement>,
) => void

/** The named props are read here; the rest is spread onto the `<input>` through ./domProps, `name` included. */
export type CheckboxProps = {
  /** Text to use for identification, uses `id` if not given */
  label?: string
  /** Will be derived from `label` if not given */
  id?: string
  /** Callback on value change */
  onChange?: CheckboxChangeHandler
  /**
   * Checked or unchecked state: `valueTrue` checks and `valueFalse` unchecks, any other value by its
   * truthiness, and a `null`/absent one leaves the input uncontrolled
   */
  value?: unknown
  /** One of ['toggle'], or else the `<input>` type */
  type?: string
  /** Tooltip */
  title?: string
  /** Checked or unchecked state, when `value` is absent */
  defaultValue?: boolean
  /** Text to show for checked state */
  labelTrue?: React.ReactNode
  /** Text to show for unchecked state */
  labelFalse?: React.ReactNode
  /** Value to assign to true case */
  valueTrue?: unknown
  /** Value to assign to false case */
  valueFalse?: unknown
  /** Input attribute */
  readonly?: boolean
  /** If true, then unchecked will have red background */
  danger?: boolean
  /** Css class to apply */
  className?: string
  translate?: Translate
  /** Forwarded to the `<input>`, and the second argument of `onChange` */
  name?: string
  /** Forwarded to the `<input>`; when `readonly`, it is still called after the change is prevented */
  onClick?: React.MouseEventHandler<HTMLInputElement>
  [key: string]: unknown
}

/**
 * Checkbox - Pure Component
 *
 * @Note: either `id` or `label` must be given
 */
export function Checkbox ({
  value,
  valueTrue = true,
  valueFalse = false,
  defaultValue,
  onChange,
  type = 'checkbox',
  title,
  label,
  labelTrue,
  labelFalse,
  id,
  readonly,
  danger,
  className,
  translate = Active.translate,
  float: _0, // not used
  initialValues: _1, // not used
  ...props
}: CheckboxProps) {
  if (readonly) {
    const onClick = props.onClick
    props.readOnly = readonly // React wants `readonly` to be `readOnly`
    props.onClick = event => {
      event.preventDefault() // checkboxes do not natively enforce readOnly
      if (onClick) onClick(event)
    }
  }
  labelTrue = labelTrue || label || 'ON'
  labelFalse = labelFalse || label || 'OFF'
  const input = useRef<HTMLInputElement>(null)
  const ownId = useOwnId(!id && label ? 'checkbox-' + label.replace(/ +?/g, '-') : undefined, input)
  if (!id) id = ownId
  if (value === valueTrue) value = true
  if (value === valueFalse) value = false
  if (value == null) {
    if (defaultValue != null) props.defaultChecked = defaultValue
  } else {
    props.checked = !!value
  }
  return (
    <Row className={classNames('checkbox--wrapper', className)}>
      <input
        // Before the spread: a ref the host passes (React 19 hands it over as a prop) still wins.
        ref={input}
        type={type === 'toggle' ? 'checkbox' : type}
        className={classNames('checkbox', type)}
        id={id}
        // `undefined` where the JavaScript passed `null`: the DOM typings reject `null`, and React attaches no
        // listener for either. Without `onChange` a change reports nothing. It threw until 2026-10-08, when the
        // packed tarball's browser smoke clicked a checkbox whose meta gave none.
        onChange={readonly ? undefined : (event) => onChange && onChange(event.target.checked ? valueTrue : valueFalse, props.name, event)}
        // DOM boundary (see ./domProps): the spread lands on the <input type="checkbox">, so ENGINE_PROPS only -- the onChange
        // above reads `props.name`, and the control needs it on the DOM.
        {...omitProps(props, ENGINE_PROPS)}
      />
      <Label
        htmlFor={id} title={translate(title)}
        className={classNames('flex--row middle justify', {danger})}
      >
        {type === 'toggle'
          ? <Fragment>
            <View className="checkbox__true">{translate(labelTrue)}</View>
            <View className="checkbox__button"/>
            <View className="checkbox__false">{translate(labelFalse)}</View>
          </Fragment>
          : (translate(label) || id)
        }
      </Label>
    </Row>
  )
}

export default React.memo(Checkbox)
