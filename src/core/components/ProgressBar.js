import classNames from '../utils/classNames'
import React, { useEffect, useRef, useState } from 'react'
import { TIME_DURATION_INSTANT } from '../utils'
import Text from './Text'
import { type } from './types'
import View from './View'

const hasProgressValue = value => Number.isFinite(value) && value >= 0
const normalizeProgressValue = value => hasProgressValue(value) ? value : 0

/**
 * Progress Bar Component
 *
 * A FUNCTION COMPONENT since §9.3 step 6. It was a `@withTimer` class whose
 * `UNSAFE_componentWillReceiveProps` applied a changed `value` before the next render and cancelled
 * the pending mount animation. Both still happen, and at the same points:
 *  - the bar mounts empty and fills to its first value after `TIME_DURATION_INSTANT`, so the CSS
 *    width transition animates it in;
 *  - a changed `value` is applied DURING render, before anything is committed, which is when the
 *    lifecycle applied it (React's documented replacement for deriving state from props);
 *  - a changed `value`, or unmounting, cancels the pending fill-in, as `clearTimer()` did.
 * Compared with `Object.is`, not `!==`: a `NaN` value is documented input, and `NaN !== NaN` would
 * re-derive on every render and never settle.
 *
 * @param {Number|NaN|Undefined|Null} [value] - fraction from 0 to 1, renders placeholder tooltip by default
 * @param {String} [className] - optional css class names to add
 * @param {Boolean} [gradient] - whether to separate bar color into two gradients
 * @param {*} [children] - text or React component to render as progress indicator
 * @param {*} [props] - other attributes to pass to component
 * @returns {Object} - React Component
 */
export function ProgressBar ({
  value: valueProp,
  className,
  gradient = true,
  children,
  styleBar,
  label,
  hasTooltip = false,
  color,
  ...props
}) {
  const [value, setValue] = useState(0)
  const [derivedFrom, setDerivedFrom] = useState(valueProp)
  if (!Object.is(valueProp, derivedFrom)) {
    setDerivedFrom(valueProp)
    setValue(normalizeProgressValue(valueProp))
  }

  // The fill-in belongs to the value the bar mounted with. When `value` changes the effect re-runs:
  // its cleanup cancels the pending fill-in and the new run schedules nothing.
  const mountValue = useRef(valueProp).current
  useEffect(() => {
    if (!Object.is(valueProp, mountValue) || !hasProgressValue(valueProp)) return
    const timer = setTimeout(() => setValue(valueProp), TIME_DURATION_INSTANT)
    return () => clearTimeout(timer)
  }, [valueProp, mountValue])

  const percentage = Math.round(value * 100)
  const width = percentage + '%'
  const tooltip = hasProgressValue(valueProp) ? (children != null ? children : width) : 'No Data'
  const style = {width, ...styleBar}
  if (color) style.backgroundColor = color
  return (
    <View className={classNames('app__progress--bar', className, {gradient})} {...props}>
      <View className={'app__progress--bar__wrapper'}>
        <View className='app__progress__bar' style={style}>
          {label != null && <Text>{label}</Text>}
          {hasTooltip &&
          <View className='app__progress__bar__tooltip'>
            <Text className='app__progress__bar__tooltip__inner'
                  style={{transform: `translateX(${(0.5 - value) * 50}%)`}}
                  children={tooltip}
            />
          </View>
          }
        </View>
      </View>
    </View>
  )
}

ProgressBar.propTypes = {
  // fraction from 0 to 1
  value: type.Fraction,
  // content to render inside the filled bar
  label: type.Any,
  // default is false
  hasTooltip: type.Boolean,
  className: type.String,
  // CSS bar color
  color: type.String,
  children: type.Any,
  // default is true
  gradient: type.Boolean,
  // style the percentage bar itself
  styleBar: type.Object,
}

// Memoised because the class was a PureComponent: it re-rendered only when a prop changed.
export default React.memo(ProgressBar)
