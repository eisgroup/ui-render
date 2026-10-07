import classNames from '../utils/classNames'
import React, { useEffect, useRef, useState } from 'react'
import { TIME_DURATION_INSTANT } from '../utils'
import Text from './Text'
import View from './View'

/** A fraction from 0 to 1; NaN, undefined and null are documented input too, and show 'No Data'. */
type ProgressValue = number | null | undefined

// The cast is what `Number.isFinite` has established by the time the comparison runs.
const hasProgressValue = (value: ProgressValue): value is number => Number.isFinite(value) && (value as number) >= 0
const normalizeProgressValue = (value: ProgressValue) => hasProgressValue(value) ? value : 0

/** The named props are read here; the rest is passed to the outer `View`. */
export type ProgressBarProps = {
  /** Fraction from 0 to 1, renders placeholder tooltip by default */
  value?: ProgressValue
  /** Optional css class names to add */
  className?: string
  /** Whether to separate bar color into two gradients, true by default */
  gradient?: boolean
  /** Text or React component to render as progress indicator */
  children?: React.ReactNode
  /** Style the percentage bar itself */
  styleBar?: React.CSSProperties
  /** Content to render inside the filled bar */
  label?: React.ReactNode
  /** Whether to render the tooltip, false by default */
  hasTooltip?: boolean
  /** CSS bar color */
  color?: string
  [key: string]: unknown
}

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
 * @returns {Object} - React Component
 */
function ProgressBar ({
  value: valueProp,
  className,
  gradient = true,
  children,
  styleBar,
  label,
  hasTooltip = false,
  color,
  ...props
}: ProgressBarProps) {
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

// Memoised because the class was a PureComponent: it re-rendered only when a prop changed.
export default React.memo(ProgressBar)
