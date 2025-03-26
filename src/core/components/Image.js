import classNames from 'classnames'
import React from 'react'
import { fileNameWithoutExt } from 'ui-utils-pack'
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
  if (props.alt == null) props.alt = fileNameWithoutExt(name)
  return <img className={classNames('img', className)} {...props}/>
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
