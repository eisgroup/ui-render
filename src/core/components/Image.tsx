import classNames from '../utils/classNames'
import React from 'react'
import { fileNameWithoutExt } from '../utils'
import { FILE } from './files'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/** The named props are read here; the rest is spread onto the `<img>` through ./domProps (see `ViewProps`). */
export type ImageProps = {
  /** File name; required if `src` or `alt` not given */
  name?: string
  /** File directory path to use if `src` not given */
  path?: string
  /** Optional css class */
  className?: string
  decoding?: 'auto' | 'async' | 'sync'
  loading?: 'eager' | 'lazy'
  /** Derived from `name` and `path` when not given */
  src?: string
  /** Derived from `name` when not given */
  alt?: string
  [key: string]: unknown
}

/** Where `imageSrc` finds an image: `avatar`, else `src`, else `name` under `path`. */
export type ImageSource = { avatar?: string, src?: string, name?: string, path?: string }

/**
 * Image - Pure Component.
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
}: ImageProps) {
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

export function imageSrc ({avatar, src, name = '', path = FILE.PATH_IMAGES}: ImageSource) {
  return avatar || src || (path + name.replace(/\s/g, '-').toLowerCase())
}

export default React.memo(Image)
