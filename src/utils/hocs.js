import React, { useContext } from 'react'
import { Active } from 'utils-pack'
import { SOUND } from '../files'

/**
 * Add Accessibility Support to React Component
 *
 * @param {Object} props - React render props
 * @param {Object} [sound] - new Audio(URL) file
 * @returns {Object} props - mutated with necessary accessibility attributes
 */
export function accessibilitySupport (props, sound = Active.SETTINGS.HAS_SOUND && SOUND.TOUCH) {
  /* Remove key press and click event if necessary */
  if (props.tabIndex === -1) {
    delete props.onKeyPress
    delete props.onClick
  } else {
    const {onClick, onKeyPress, tabIndex} = props
    if (onKeyPress) props.onKeyPress = onPressHoc(onKeyPress, sound)
    if (onClick) {
      props.onClick = onPressHoc(onClick, sound)
      if (tabIndex == null) props.tabIndex = 0  // add keyboard accessibility for onClick
      if (!onKeyPress) props.onKeyPress = (event) => (event.key === 'Enter' && props.onClick(event))
    } else {
      delete props.onClick
    }
  }
  return props
}

/**
 * Higher Order Function Wrapper for onClick event to play sound
 * @example:
 *    <Button onClick={onPressHoc(onClick, sound)}/>
 *
 * @param {Function} onClick
 * @param {Object} [sound] - new Audio(URL) file object
 * @returns {Function} onPress - callback
 */
export function onPressHoc (onClick, sound) {
  return function onPress () {
    if (sound) sound.play()
    onClick && onClick(...arguments)
  }
}

/**
 * React Component Context Decorator
 */
export function withContext (Component) {
  return function ContextWrapper (props) {
    const context = useContext(UIContext)
    return <Component {...context} {...props}/>
  }
}

/**
 * React Component Timer Decorator to clearTimeout() and clearInterval() automatically on componentWillUnmount()
 * @example:
 *    @withTimer
 *    class Homepage extends Component {
 *      animate = () => {
 *        this.setTimeout(this.props.animate, 500)
 *        this.setInterval(this.props.refresh, 500)
 *      }
 *    }
 *
 * @param {Object} Class - to be decorated
 */
export function withTimer (Class) {
  const componentWillUnmount = Class.prototype.componentWillUnmount

  Class.prototype.setTimeout = function () {
    if (!this.timers) this.timers = []
    this.timers.push(setTimeout(...arguments))
  }

  Class.prototype.setInterval = function () {
    if (!this.intervals) this.intervals = []
    this.intervals.push(setInterval(...arguments))
  }

  Class.prototype.clearTimer = function () {
    if (this.timers) this.timers.forEach(clearTimeout)
    if (this.intervals) this.intervals.forEach(clearInterval)
  }

  Class.prototype.componentWillUnmount = function () {
    this.clearTimer()
    if (componentWillUnmount) componentWillUnmount.apply(this, arguments)
  }

  return Class
}

export const UIContext = React.createContext({})
