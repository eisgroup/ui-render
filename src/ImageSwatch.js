import cn from 'classnames'
import React from 'react'
import Text from './Text'
import { type } from './types'
import { cssBgImageFrom } from './utils'

/**
 * Image Swatch - Pure Component.
 */
export function ImageSwatch ({
  src,
  name,
  small,
  large,
  className,
  style,
  ...props
}) {
  if (src) style = {backgroundImage: cssBgImageFrom({src, name}), ...style}
  return <Text className={cn('image__swatch', className, {small, large})} style={style} {...props}/>
}

ImageSwatch.propTypes = {
  /** Full Path, URL, Base64 or Preview String object of Image file */
  src: type.UrlOrBase64OrPreview.isRequired,
  small: type.Boolean,
  large: type.Boolean,
  className: type.String,
  style: type.Object,
}

export default React.memo(ImageSwatch)
