import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { ONE_SECOND, TIME_DURATION_INSTANT } from '../utils'
import { renderFloat } from './renders'
import { useTimers } from './utils'

const DEFAULT_INTERVAL = 17
const MAX_ANIMATION_STEPS = 10000

/** What the animation runs from: the props that restart it when their value changes. */
type Animation = {
  start: number
  end: number
  duration?: number
  delay?: number
  interval?: number
  easingFn: (progress: number) => number
}
const ANIMATION_PROPS: Array<keyof Animation> = ['start', 'end', 'duration', 'delay', 'interval', 'easingFn']

/** The displayed value and the steps left. */
export type CounterFrame = { value: number, steps: number }

/** How a value is shown: `renderFloat` by default. */
export type CounterRender = (value: number, decimals: number) => React.ReactNode

export type CounterProps = {
  /** Default is 0 */
  start?: number
  end: number
  /** Number formatting function */
  render?: CounterRender
  /** Default is 0 */
  decimals?: number
  /** Animation delay, default is TIME_DURATION_INSTANT */
  delay?: number
  /** Animation duration */
  duration?: number
  /** Animation interval, default is 17 ms, which translates to ~60 frames per second */
  interval?: number
  /** Animation easing function, see https://gist.github.com/gre/1650294 */
  easingFn?: (progress: number) => number
  /** Declared by `propTypes`, and not read */
  className?: string
  /** Declared by `propTypes`, and not read */
  style?: React.CSSProperties
}

// A module constant, not an inline default: the animation restarts whenever `easingFn` changes, so a
// default created per render would restart it on every render. The class's `defaultProps` held one.
const cubicEasing = (t: number) => t * t * t

// `===`, except that NaN equals NaN. The class compared with `!==` inside a lifecycle, so a NaN prop
// restarted the animation on every parent render; compared during render, it would never settle.
const sameValue = (a: unknown, b: unknown) => a === b || (Number.isNaN(a) && Number.isNaN(b))

/** How an animation runs, from its props: what the class's `setup()` computed. */
const planOf = ({end, start, duration = ONE_SECOND, delay = TIME_DURATION_INSTANT, interval = DEFAULT_INTERVAL}: Animation) => {
  const safeDuration = Number.isFinite(duration) && duration >= 0 ? duration : ONE_SECOND
  const safeDelay = Number.isFinite(delay) && delay >= 0 ? delay : TIME_DURATION_INSTANT
  const safeInterval = Number.isFinite(interval) && interval > 0 ? interval : DEFAULT_INTERVAL
  const steps = end === start || safeDuration === 0
    ? 0
    : Math.min(Math.ceil(safeDuration / safeInterval), MAX_ANIMATION_STEPS)
  return {steps, safeDelay, safeDuration}
}

/** The displayed value and the steps left, as an animation starts. */
const initialState = (animation: Animation): CounterFrame => {
  const {steps, safeDuration} = planOf(animation)
  return {steps, value: safeDuration === 0 ? animation.end : animation.start}
}

/**
 * One frame of the animation: the value moves `1/steps` of the way to `end`, and the last frame lands
 * on `end` exactly. A frame with no steps left changes nothing, and returns the same state object so
 * React skips the update, as the class's updater did by returning `null`.
 *
 * @param {{value: Number, steps: Number}} state - the displayed value and the steps left
 * @param {Number} end - the value the animation finishes on
 * @returns {{value: Number, steps: Number}} the next state
 */
export const nextFrame = (state: CounterFrame, end: number): CounterFrame => {
  const {value, steps} = state
  if (steps <= 0) return state
  const nextSteps = steps - 1
  return {
    value: nextSteps ? value + (end - value) / steps : end,
    steps: nextSteps,
  }
}

/**
 * Animated Number Counter using Localised Render Float function
 *
 * A FUNCTION COMPONENT since §9.3 step 6. It was a `@withTimer` PureComponent whose
 * `UNSAFE_componentWillReceiveProps` restarted the animation, before the next render, when an
 * animation prop changed its value. It still does, and at the same point:
 *  - a changed animation prop resets the displayed value during render, before anything is
 *    committed;
 *  - the timers run in an effect for that animation, whose cleanup cancels the delay and every
 *    frame when the animation changes again or the counter unmounts, which is what `clearTimer()`
 *    did.
 * Memoised, as the class was a PureComponent: the lifecycle compared values, so a parent render with
 * equal props had nothing to restart.
 */
function Counter ({
  start = 0,
  end,
  render = renderFloat,
  decimals = 0,
  delay,
  duration,
  interval,
  easingFn = cubicEasing,
}: CounterProps) {
  const animation: Animation = {start, end, duration, delay, interval, easingFn}
  const [running, setRunning] = useState(animation)
  const [state, setState] = useState(() => initialState(animation))
  if (ANIMATION_PROPS.some((prop) => !sameValue(running[prop], animation[prop]))) {
    setRunning(animation)
    setState(initialState(animation))
  }

  const timers = useTimers()
  useEffect(() => {
    const {steps, safeDelay, safeDuration} = planOf(running)
    if (!steps) return
    timers.setTimeout(() => {
      for (let i = 0; i < steps; i++) {
        const progress = (i + 1) / steps
        const easedProgress = running.easingFn(progress)
        const frameDelay = Number.isFinite(easedProgress)
          ? Math.max(0, safeDuration * easedProgress)
          : safeDuration * progress
        timers.setTimeout(() => setState((current) => nextFrame(current, running.end)), frameDelay)
      }
    }, safeDelay)
    return () => timers.clear()
  }, [running, timers])

  return render(state.value, decimals)
}

Counter.propTypes = {
  start: PropTypes.number, // default is 0
  end: PropTypes.number.isRequired,
  render: PropTypes.func, // number formatting function
  decimals: PropTypes.number, // default is 0
  delay: PropTypes.number, // animation delay, default is TIME_DURATION_INSTANT
  duration: PropTypes.number, // animation duration
  interval: PropTypes.number, // animation interval, default is 17 ms, which translates to ~60 frames per second
  easingFn: PropTypes.func, // animation easing function, see https://gist.github.com/gre/1650294
  className: PropTypes.string,
  style: PropTypes.object,
}

export default React.memo(Counter)
