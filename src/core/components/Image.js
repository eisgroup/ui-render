import classNames from '../utils/classNames'
import React from 'react'
import { fileNameWithoutExt } from '../utils'
import { FILE } from './files'
import { type } from './types'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

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
  // Default parameters rather than `Image.defaultProps`: React 18.3 warns on defaultProps for
  // function components and React 19 removes the support. Forwarded explicitly below.
  decoding = 'async',
  loading = 'lazy',
  ...props
}) {
  if (props.src == null) props.src = imageSrc({name, path})
  // `name` is optional (a caller may pass only `src`), and fileNameWithoutExt has no guard of its own,
  // so deriving the alt text unconditionally used to throw. An empty alt is the correct value for an
  // image with nothing to describe.
  if (props.alt == null) props.alt = name ? fileNameWithoutExt(name) : ''
  // Restated after the spread so jsx-a11y can see it — same value, set on the line above.
  // DOM boundary (see ./domProps): the spread lands on an <img>. `name` was consumed above to
  // derive `src`/`alt` and is not an HTML5 <img> attribute, so both lists apply.
  return <img className={classNames('img', className)} {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)}
              alt={props.alt} decoding={decoding} loading={loading}/>
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
