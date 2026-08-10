import classNames from '../utils/classNames'
import React from 'react'
import { fileNameWithoutExt } from '../utils'
import { FILE } from './files'
import { type } from './types'

/**
 * Image - Pure Component.
 *
 * @param {String} name - file name
 * @param {String} [path] - file directory path to use if `src` not given
 * @param {String} [className] - optional css class
 * @param {*} [props] - other attributes to pass to `<img>`
 * @returns {Object} - React component
 */
export function Image ({
  name,
  path,
  className,
  ...props
}) {
  if (props.src == null) props.src = imageSrc({name, path})
  // `name` is optional (a caller may pass only `src`), and fileNameWithoutExt has no guard of its own,
  // so deriving the alt text unconditionally used to throw. An empty alt is the correct value for an
  // image with nothing to describe.
  if (props.alt == null) props.alt = name ? fileNameWithoutExt(name) : ''
  // Restated after the spread so jsx-a11y can see it — same value, set on the line above.
  return <img className={classNames('img', className)} {...props} alt={props.alt}/>
}

Image.defaultProps = {
  decoding: 'async',
  loading: 'lazy',
}
Image.propTypes = {
  // Required if `src` or `alt` not defined
  name: type.String,
  path: type.String,
  className: type.String,
  decoding: type.Enum(['auto', 'async', 'sync']),
  loading: type.Enum(['eager', 'lazy']),
}

export function imageSrc ({avatar, src, name = '', path = FILE.PATH_IMAGES}) {
  return avatar || src || (path + name.replace(/\s/g, '-').toLowerCase())
}

export default React.memo(Image)
