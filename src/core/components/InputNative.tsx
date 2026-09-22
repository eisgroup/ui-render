import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { noSpellCheck, resizeToContent, toTextHeight, toTextHeightFunc } from './renders'
import Select from './Select'
import { ENGINE_PROPS, omitProps } from './domProps'

/**
 * The native elements this component can mount: `type` decides which one, and both the
 * compact-resize and the color-swatch code paths read `.value`/`.style` off whichever it is.
 * (`type='select'` renders `Select`, which owns its own `<select>` — never `this.element`.)
 */
export type InputNativeElement = HTMLInputElement | HTMLTextAreaElement

/**
 * What is left after the DOM boundary filter and gets spread onto the rendered element.
 *
 * It has to be stated separately from `InputNativeProps` because the two disagree on purpose:
 * `InputNativeProps.onChange` is the ENGINE callback `(value, name, event)`, while the bag spread
 * onto `<input>`/`<textarea>` always carries a DOM handler instead — `render()` overwrites the key
 * on every branch before spreading. The cast at the `omitProps` call is where that swap happens.
 */
type ForwardedProps =
  Omit<
    React.InputHTMLAttributes<InputNativeElement> & React.TextareaHTMLAttributes<InputNativeElement>,
    'value' | 'checked'
  > & {
    // `value`/`checked` stay open on purpose: callers pass booleans, numbers and objects here
    // (`type='checkbox'` even copies `value` into `checked`), and the DOM's own narrower types
    // would reject usage the tests pin down.
    value?: any
    checked?: any
    [prop: string]: any
  }

/**
 * Props of `InputNative`.
 *
 * The index signature is not laziness: this component is the DOM boundary for the whole input
 * family, and `Input` spreads its own rest bag straight into it, so the accepted set is "every
 * attribute of `<input>`/`<textarea>`/`<select>`, plus whatever the engine did not consume".
 * The named entries below are the ones this component READS; everything else is forwarded.
 */
export type InputNativeProps = {
  /* Controlled value */
  value?: any
  defaultValue?: any
  /* Input type */
  type?: string
  /* Textarea rows */
  rows?: number
  /* Callback(value) when input value changes */
  onChange?: (value: any, name: any, event: any) => void
  /* Whether to resize input width to match content length */
  compact?: boolean | number
  /* Whether to adjust input height to match typed in text */
  resize?: boolean
  /* Whether to have no spell check or correction */
  disabledSpellCheck?: boolean
  /* Callback(element) on mount */
  onMount?: (element: InputNativeElement) => void
  /* Form field registration path, and the second argument of every onChange below */
  name?: string
  /* Checkbox state; falls back to `value` when not given */
  checked?: boolean
  /* Forwarded, and wrapped by this component when `resize` is set */
  onKeyUp?: (event: any) => void
  /* Anything else is passed through to the rendered element */
  [prop: string]: any
}

/**
 * Input - Pure Component.
 * Abstraction layer for React Web
 */
export default class InputNative extends PureComponent<InputNativeProps> {
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

  /* Set by the `ref` callbacks below; absent until the element mounts */
  element?: InputNativeElement | null

  UNSAFE_componentWillReceiveProps (next: Readonly<InputNativeProps>, nextContext: any) {
    const {compact, value} = this.props
    if (next.compact != null) {
      let inputValue: unknown
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

  onChange = (event: React.ChangeEvent<InputNativeElement>) => {
    const {target: {value, style}} = event
    const {onChange, compact, name} = this.props
    if (compact != null) resizeToContent(value, style, compact)
    onChange && onChange(value, name, event)
  }

  onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {target: {checked}} = event
    const {onChange, name} = this.props
    onChange && onChange(checked, name, event)
  }

  // @see: https://stackoverflow.com/questions/11167281/webkit-css-to-control-the-box-around-the-color-in-an-inputtype-color
  onChangeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {target} = event
    const {onChange, name} = this.props
    target.style.backgroundColor = target.value
    onChange && onChange(target.value, name, event)
  }

  onMountColor = (element: InputNativeElement | null) => {
    if (!element) return
    this.element = element
    element.style.backgroundColor = element.value
  }

  onMountResize = (element: InputNativeElement | null) => {
    if (!element) return
    const {compact, onMount} = this.props
    this.element = element
    resizeToContent(element.value, element.style, compact)
    onMount && onMount(element)
  }

  onKeyUp = (event: React.KeyboardEvent<InputNativeElement>) => {
    const {onKeyUp} = this.props
    const textHeightFunc = (event.key === 'Enter') ? toTextHeightFunc : toTextHeight // resize instantly for Enter
    textHeightFunc(event)
    onKeyUp && onKeyUp(event)
  }

  render () {
    const {
      disabledSpellCheck,
      resize,
      compact,
      onMount,
      initialValues,
      ...rest
    }: InputNativeProps = this.props
    // DOM boundary for the whole input family (<input>, <textarea>, and <select> via Select).
    // ENGINE_PROPS only, and that is the load-bearing half of the split: `name` is the
    // react-final-form registration path and the second argument of every onChange below,
    // `label` is what Select renders as its accessible label — stripping FIELD_ONLY_PROPS
    // here would break every form silently. See ./domProps.js.
    let props: ForwardedProps = omitProps(rest, ENGINE_PROPS) as ForwardedProps
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
