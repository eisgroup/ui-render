import cn from 'classnames'
import React from 'react'
import Image from './Image'
import { type } from './types'
import View from './View'

/**
 * Image Swatch - Pure Component.
 */
export function ImageSwatch ({
  src,
  name,
  small,
  large,
  className,
  children,
  ...props
}) {
  // Use <img> for SEO and lazy load performance
  return <View className={cn('image__swatch', className, {small, large})} {...props}>
    <Image src={src} alt={name}/>
    {children}
  </View>
}

ImageSwatch.defaultProps = {
  name: '',
}
ImageSwatch.propTypes = {
  /** Full Path, URL, Base64 or Preview String object of Image file */
  src: type.UrlOrBase64.isRequired,
  small: type.Boolean,
  large: type.Boolean,
  className: type.String,
  style: type.Object,
}

export default React.memo(ImageSwatch)
