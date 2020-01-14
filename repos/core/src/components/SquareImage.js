import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { imageSrc } from './Image'
import Square from './Square'

/**
 * Square Image Container - Pure Component
 * (Render inner content as a square, resizing to fit dynamic width and height from parent)
 */
export default function SquareImage ({ name, path, className, ...props }) {
  const backgroundImage = `url('${imageSrc({ name, path })}')`
  return (
    <Square className={classNames('bg-image--cover', className)} {...props} style={{ backgroundImage }}/>
  )
}

Square.propTypes = {
  name: PropTypes.string.isRequired, // image file name
  path: PropTypes.string, // image file directory path
  // All other <Image/> and <Square/> props
}
