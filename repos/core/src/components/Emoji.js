import React from 'react'
import { round } from '../common/utils'

/**
 * Emoji - Pure Component to center emoji
 * @see: https://stackoverflow.com/questions/44142464/how-do-i-horizontally-center-an-emoji
 */
export default function Emoji
  ({small, large, ...props}) {
  let size = 4
  if (small) size *= 0.75
  if (large) size *= 2
  return (
    <span role="img" {...props} style={{
      display: 'inline-block',
      fontSize: `${size}em`,
      transform: `scale(.25) translateY(${large ? 6.175 : 2.175}em)`,
      transformOrigin: 'center',
      margin: `-${round(size / 4, 3)}em -.333em`,
    }}/>
  )
}
