import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { noSpellCheck, resizeToContent, toTextHeight, toTextHeightFunc } from './renders'
import Select from './Select'
import { onPressHoc } from './utils'

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
    /* Audio sound file to play on touch */
    sound: PropTypes.object,
    /* Callback(element) on mount */
    onMount: PropTypes.func,
  }

  componentDidUpdate (prev, prevState, snapshot) {
    const {value, compact} = this.props
    if (compact && prev.value !== value) resizeToContent(this.element.value, this.element.style, compact)
  }

  onChange = ({target: {value, style}}) => {
    const {onChange, compact} = this.props
    if (compact) resizeToContent(value, style, compact)
    onChange && onChange(value)
  }

  onChangeCheckbox = ({target: {checked}}) => {
    const {onChange, sound} = this.props
    onChange && onPressHoc(onChange, sound)(checked)
  }

  // @see: https://stackoverflow.com/questions/11167281/webkit-css-to-control-the-box-around-the-color-in-an-inputtype-color
  onChangeColor = ({target}) => {
    const {onChange} = this.props
    target.style.backgroundColor = target.value
    onChange && onChange(target.value)
  }

  onMountColor = (element) => {
    if (!element) return
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
      sound,
      onMount,
      initialValues,
      ...props
    } = this.props
    if (disabledSpellCheck) props = {...noSpellCheck, ...props}
    if (resize) {
      // Must use onKeyUp because onKeyDown/onKeyPress does not register `Enter` or fire too many times
      props.onKeyUp = this.onKeyUp
      props.type = 'textarea' // only textarea can resize
      if (!props.rows) props.rows = 1
    }
    if (compact) props.ref = this.onMountResize
    switch (props.type) {
      case 'select':
        return <Select {...props} />
      case 'checkbox':
        props.onChange = this.onChangeCheckbox
        if (props.checked == null && props.value != null) props.checked = props.value
        return <input {...props} />
      case 'color':
        props.onChange = this.onChangeColor
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
