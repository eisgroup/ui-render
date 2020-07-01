import PropTypes from 'prop-types'
import React, { useContext } from 'react'
import { warn } from 'utils-pack'
import { SOUND } from './files'
import styles from './styles'

export {default as cn} from 'classnames'
export {default as PropTypes} from 'prop-types'

/**
 * Add Accessibility Support to React Component
 *
 * @param {Object} props - React render props
 * @param {Object} [sound] - new Audio(URL) file
 * @returns {Object} props - mutated with necessary accessibility attributes
 */
export function accessibilitySupport (props, sound = SOUND.TOUCH) {
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
 * Convert unitless pixels value to Rem equivalent
 *
 * @param {Number} pixels - to convert to rem
 * @returns {String} rem - equivalent
 */
export function toRem (pixels) {
  return (pixels / 16 / styles.SIZE_SCALE * 100) + 'rem'
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

/**
 * React Component Group Input Change Decorator to fire onChange callback as group of fields together
 *
 * @usage:
 *  - provides this.fields prop that is automatically hooked with `onChange` to fire callback as group of inputs
 *
 * @example:
 *    @withGroupInputChange
 *    class Fields extends Component {
 *      render () {
 *        return this.fields.map(renderField)
 *      }
 *    }
 *
 * @param {Object} constructor - class
 */
export function withGroupInputChange (constructor) {
  const componentDidMount = constructor.prototype.componentDidMount

  constructor.propTypes = {
    name: PropTypes.string, // top level field prefix
    items: PropTypes.array.isRequired, // list of fields attributes to render
    initialValues: PropTypes.object, // input default values, required for `onChange` callback to work properly
    onChange: PropTypes.func, // callback, receiving all nested field value changes combined, grouped by input name
    required: PropTypes.bool, // input prop
    disabled: PropTypes.bool, // input prop
    ...constructor.propTypes,
  }

  // Define instance getter
  Object.defineProperty(constructor.prototype, 'fields', {
    get () {
      // Hook to `onChange` call from each field in the group
      const {items, name: prefix} = this.props
      return items.map(({name, onChange, ...field}) => ({
        name: prefix ? (prefix + '.' + name) : name,
        onChange: (val, ...args) => {
          onChange && onChange(val, ...args)
          this.handleChangeInput(name, val)
        },
        ...field,
      }))
    }
  })

  constructor.prototype.handleChangeInput = function (name, value) {
    const {onChange} = this.props
    if (!onChange) return
    this.values = {...this.values, [name]: value}
    onChange(this.values)
  }

  constructor.prototype.componentDidMount = function () {
    const {onChange, initialValues, name} = this.props
    if (name && onChange && initialValues === undefined)
      warn(this.constructor.name, `.${name} requires 'initialValues', if 'onChange(values)' is used`)
    if (initialValues) this.values = {...initialValues}
    if (componentDidMount) componentDidMount.apply(this, arguments)
  }

  return constructor
}

export const UIContext = React.createContext({})
