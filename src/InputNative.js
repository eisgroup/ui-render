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

  onChange = ({target: {value, style}}) => {
    const {onChange, compact} = this.props
    if (compact) resizeToContent(value, style, compact)
    onChange && onChange(value)
  }

  onMountResize = (element) => {
    const {compact, onMount} = this.props
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
      onChange,
      disabledSpellCheck,
      resize,
      compact,
      sound,
      onMount,
      ...props
    } = this.props
    if (disabledSpellCheck) props = {...noSpellCheck, ...props}
    if (resize) {
      // Must use onKeyUp because onKeyDown/onKeyPress does not register `Enter` or fire too many times
      props.onKeyUp = this.onKeyUp
      props.type = 'textarea' // only textarea can resize
      if (!props.rows) props.rows = 1
    }
    props.onChange = this.onChange
    if (compact) props.ref = this.onMountResize
    switch (props.type) {
      case 'select':
        return <Select {...props} />
      case 'textarea':
        return <textarea {...props} />
      case 'checkbox':
        props.onChange = ({target: {checked}}) => onPressHoc(onChange, sound)(checked)
        if (props.checked == null && props.value != null) props.checked = props.value
        return <input {...props} />
      default:
        return <input {...props} />
    }
  }
}
