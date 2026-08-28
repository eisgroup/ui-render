import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { noSpellCheck, resizeToContent, toTextHeight, toTextHeightFunc } from './renders'
import Select from './Select'
import { ENGINE_PROPS, omitProps } from './domProps'

/**
 * Input - Pure Component.
 * Abstraction layer for React Web
 */
export default class InputNative extends PureComponent {
  static propTypes = {
    /* Controlled value */
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    /* Input type */
    type: PropTypes.string,
    /* Textarea rows */
    rows: PropTypes.number,
    /* Callback(value) when input value changes */
    onChange: PropTypes.func,
    /* Whether to resize input width to match content length */
    compact: PropTypes.oneOfType([
      PropTypes.bool,
      // Width offset
      PropTypes.number,
    ]),
    /* Whether to adjust input height to match typed in text */
    resize: PropTypes.bool,
    /* Whether to have no spell check or correction */
    disabledSpellCheck: PropTypes.bool,
    /* Callback(element) on mount */
    onMount: PropTypes.func,
  }

  UNSAFE_componentWillReceiveProps (next, nextContext) {
    const {compact, value} = this.props
    if (next.compact != null) {
      let inputValue
      let shouldResize = false
      if (next.value !== value) {
        inputValue = next.value
        shouldResize = true
      } else if (next.compact !== compact) {
        inputValue = this.element ? this.element.value : next.value
        shouldResize = true
      }
      if (shouldResize && this.element) {
        resizeToContent(inputValue == null ? '' : String(inputValue), this.element.style, next.compact)
      }
    }
  }

  onChange = (event) => {
    const {target: {value, style}} = event
    const {onChange, compact, name} = this.props
    if (compact != null) resizeToContent(value, style, compact)
    onChange && onChange(value, name, event)
  }

  onChangeCheckbox = (event) => {
    const {target: {checked}} = event
    const {onChange, name} = this.props
    onChange && onChange(checked, name, event)
  }

  // @see: https://stackoverflow.com/questions/11167281/webkit-css-to-control-the-box-around-the-color-in-an-inputtype-color
  onChangeColor = (event) => {
    const {target} = event
    const {onChange, name} = this.props
    target.style.backgroundColor = target.value
    onChange && onChange(target.value, name, event)
  }

  onMountColor = (element) => {
    if (!element) return
    this.element = element
    element.style.backgroundColor = element.value
  }

  onMountResize = (element) => {
    if (!element) return
    const {compact, onMount} = this.props
    this.element = element
    resizeToContent(element.value, element.style, compact)
    onMount && onMount(element)
  }

  onKeyUp = (event) => {
    const {onKeyUp} = this.props
    const textHeightFunc = (event.key === 'Enter') ? toTextHeightFunc : toTextHeight // resize instantly for Enter
    textHeightFunc(event)
    onKeyUp && onKeyUp(event)
  }

  render () {
    let {
      disabledSpellCheck,
      resize,
      compact,
      onMount,
      initialValues,
      ...props
    } = this.props
    // DOM boundary for the whole input family (<input>, <textarea>, and <select> via Select).
    // ENGINE_PROPS only, and that is the load-bearing half of the split: `name` is the
    // react-final-form registration path and the second argument of every onChange below,
    // `label` is what Select renders as its accessible label — stripping FIELD_ONLY_PROPS
    // here would break every form silently. See ./domProps.js.
    props = omitProps(props, ENGINE_PROPS)
    if (disabledSpellCheck) props = {...noSpellCheck, ...props}
    if (resize) {
      // Must use onKeyUp because onKeyDown/onKeyPress does not register `Enter` or fire too many times
      props.onKeyUp = this.onKeyUp
      props.type = 'textarea' // only textarea can resize
      if (!props.rows) props.rows = 1
    }
    if (compact != null) props.ref = this.onMountResize
    switch (props.type) {
      case 'select':
        return <Select {...props} />
      case 'checkbox':
        props.onChange = this.onChangeCheckbox
        if (props.checked == null && props.value != null) props.checked = props.value
        return <input {...props} />
      case 'color':
        if (this.element && props.value !== this.element.value) {
          this.element.style.backgroundColor = props.value // update color for controlled input
        }
        props.onChange = this.onChangeColor // update color for uncontrolled input
        props.ref = this.onMountColor
        return <input {...props} />
      case 'textarea':
        props.onChange = this.onChange
        return <textarea {...props} />
      default:
        props.onChange = this.onChange
        return <input {...props} />
    }
  }
}
