import cn from 'classnames'
import React from 'react'
import Text from './Text'
import { type } from './types'

/**
 * Texture Swatch - Pure Component.
 */
export function TextureSwatch ({
  src,
  small,
  large,
  className,
  style,
  ...props
}) {
  if (src) style = {backgroundImage: `url('${src}')`, ...style}
  return <Text className={cn('texture__swatch', className, {small, large})} style={style} {...props}/>
}

TextureSwatch.propTypes = {
  /** Full Path, URL, Base64 or Preview String object of Image file */
  src: type.UrlOrBase64OrPreview.isRequired,
  small: type.Boolean,
  large: type.Boolean,
  className: type.String,
  style: type.Object,
}

export default React.memo(TextureSwatch)
