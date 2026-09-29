import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { noSpellCheck, resizeToContent, toTextHeight, toTextHeightFunc } from './renders'
import Select from './Select'
import { ENGINE_PROPS, omitProps } from './domProps'

/**
 * The native elements this component can mount: `type` decides which one, and both the
 * compact-resize and the color-swatch code paths read `.value`/`.style` off whichever it is.
 * (`type='select'` renders `Select`, which owns its own `<select>` — never the element kept here.)
 */
export type InputNativeElement = HTMLInputElement | HTMLTextAreaElement

/**
 * What is left after the DOM boundary filter and gets spread onto the rendered element.
 *
 * It has to be stated separately from `InputNativeProps` because the two disagree on purpose:
 * `InputNativeProps.onChange` is the ENGINE callback `(value, name, event)`, while the bag spread
 * onto `<input>`/`<textarea>` always carries a DOM handler instead — the render overwrites the key
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
 * `useLayoutEffect` in a browser, where the resize below has to land before paint, and `useEffect`
 * on the server. There is no DOM to resize there, and React 16 and 17 warn about a layout effect on
 * every server render.
 */
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Input - Component.
 * Abstraction layer for React Web
 *
 * A FUNCTION COMPONENT since §9.3 step 6, memoised like the PureComponent it was. Its
 * `UNSAFE_componentWillReceiveProps` compared `value` and `compact` with the previous props, so a
 * parent render with equal props had nothing to do.
 *  - That lifecycle resized a compact input to a changed value, or to what the input held when
 *    only `compact` changed. The resize now happens after the commit, in a layout effect, which
 *    still lands before paint. The class did it before the render, during the render phase.
 *  - Render also changed the DOM: a controlled color input took a changed value as its background.
 *    That happens in the same effect now.
 *  - The ref callbacks keep one identity, as the class's instance fields did. A new one on every
 *    render would be called on every render, resizing again and calling `onMount` again.
 */
function InputNative (props: InputNativeProps) {
  const {
    disabledSpellCheck,
    resize,
    compact,
    onMount,
    initialValues,
    ...rest
  }: InputNativeProps = props
  const element = useRef<InputNativeElement | null>(null)
  // What the handlers and ref callbacks read when they run: the latest props, as `this.props` was.
  const latest = useRef(props)
  latest.current = props

  const onMountResize = useCallback((node: InputNativeElement | null) => {
    if (!node) return
    const {compact, onMount} = latest.current
    element.current = node
    resizeToContent(node.value, node.style, compact)
    onMount && onMount(node)
  }, [])

  const onMountColor = useCallback((node: InputNativeElement | null) => {
    if (!node) return
    element.current = node
    node.style.backgroundColor = node.value
  }, [])

  // The element the render below picks, which decides whether the color branch applies.
  const type = resize ? 'textarea' : rest.type
  const previous = useRef<InputNativeProps | null>(null)
  useBeforePaintEffect(() => {
    const before = previous.current
    previous.current = props
    const node = element.current
    if (!before || !node) return
    if (compact != null) {
      if (props.value !== before.value) {
        resizeToContent(props.value == null ? '' : String(props.value), node.style, compact)
      } else if (compact !== before.compact) {
        resizeToContent(node.value == null ? '' : String(node.value), node.style, compact)
      }
    }
    // update color for controlled input
    if (type === 'color' && props.value !== before.value) node.style.backgroundColor = props.value
  })

  const onChange = (event: React.ChangeEvent<InputNativeElement>) => {
    const {target: {value, style}} = event
    const {onChange, compact, name} = latest.current
    if (compact != null) resizeToContent(value, style, compact)
    onChange && onChange(value, name, event)
  }

  const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {target: {checked}} = event
    const {onChange, name} = latest.current
    onChange && onChange(checked, name, event)
  }

  // @see: https://stackoverflow.com/questions/11167281/webkit-css-to-control-the-box-around-the-color-in-an-inputtype-color
  const onChangeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {target} = event
    const {onChange, name} = latest.current
    target.style.backgroundColor = target.value
    onChange && onChange(target.value, name, event)
  }

  const onKeyUp = (event: React.KeyboardEvent<InputNativeElement>) => {
    const {onKeyUp} = latest.current
    const textHeightFunc = (event.key === 'Enter') ? toTextHeightFunc : toTextHeight // resize instantly for Enter
    textHeightFunc(event)
    onKeyUp && onKeyUp(event)
  }

  // DOM boundary for the whole input family (<input>, <textarea>, and <select> via Select).
  // ENGINE_PROPS only, and that is the load-bearing half of the split: `name` is the
  // react-final-form registration path and the second argument of every onChange below,
  // `label` is what Select renders as its accessible label — stripping FIELD_ONLY_PROPS
  // here would break every form silently. See ./domProps.js.
  let forwarded: ForwardedProps = omitProps(rest, ENGINE_PROPS) as ForwardedProps
  if (disabledSpellCheck) forwarded = {...noSpellCheck, ...forwarded}
  if (resize) {
    // Must use onKeyUp because onKeyDown/onKeyPress does not register `Enter` or fire too many times
    forwarded.onKeyUp = onKeyUp
    forwarded.type = 'textarea' // only textarea can resize
    if (!forwarded.rows) forwarded.rows = 1
  }
  if (compact != null) forwarded.ref = onMountResize
  switch (forwarded.type) {
    case 'select':
      return <Select {...forwarded} />
    case 'checkbox':
      forwarded.onChange = onChangeCheckbox
      if (forwarded.checked == null && forwarded.value != null) forwarded.checked = forwarded.value
      return <input {...forwarded} />
    case 'color':
      forwarded.onChange = onChangeColor // update color for uncontrolled input
      forwarded.ref = onMountColor
      return <input {...forwarded} />
    case 'textarea':
      forwarded.onChange = onChange
      return <textarea {...forwarded} />
    default:
      forwarded.onChange = onChange
      return <input {...forwarded} />
  }
}

InputNative.propTypes = {
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

export default React.memo(InputNative)
