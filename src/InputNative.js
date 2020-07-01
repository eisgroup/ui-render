import React from 'react'
import { SOUND } from './files'
import { toTextHeight, toTextHeightFunc } from './renders'
import Select from './Select'
import { onPressHoc } from './utils'

/**
 * Input - Pure Component.
 * Abstraction layer for React Web
 *
 * @param {Function} onChange - callBack when input value changes
 * @param {Function} [normalize] - validator function
 * @param {Boolean} [disabledSpellCheck] - no spell check or correction
 * @param {Boolean} [resize] - whether to adjust input height to match typed in text
 * @param {Object} [sound] - new Audio(URL) sound file
 * @param {*} props - attributes to pass to `<input />`
 * @returns {Object} - React Component
 */
export default function InputNative
  ({
     onChange = (val) => console.log('Input onChange', typeof val, val),
     normalize,
     disabledSpellCheck,
     resize,
     sound = SOUND.TOUCH,
     ...props
   }) {
  delete props.initialValues
  if (disabledSpellCheck) props = { ...noSpellCheck, ...props }
  if (resize) {
    props.type = 'textarea' // only textarea can resize
    // Must use onKeyUp because onKeyDown/onKeyPress does not register `Enter` or fire too many times
    props.onKeyUp = onKeyUp.bind(this, props.onKeyUp)
    if (!props.rows) props.rows = 1
  }
  props.onChange = ({target: {value}}) => onChange(normalize ? normalize(value) : value)
  switch (props.type) {
    case 'select':
      return <Select {...props} />
    case 'textarea':
      return <textarea {...props} />
    case 'checkbox':
      props.onChange = ({ target: { checked } }) => onPressHoc(onChange, sound)(checked)
      if (props.checked == null && props.value != null) props.checked = props.value
      return <input {...props} />
    default:
      return <input {...props} />
  }
}
const noSpellCheck = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
}

function onKeyUp (callBack, e) {
  const textHeightFunc = e.key === 'Enter' ? toTextHeightFunc : toTextHeight // adjust height instantly for Enter
  callBack ? (textHeightFunc(e) || callBack(e)) : textHeightFunc(e)
}
