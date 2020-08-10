import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { fileNameWithoutExt } from 'utils-pack'
import { FILE } from './files'

/**
 * Image - Pure Component.
 *
 * @param {String} name - file name path
 * @param {String} [path] - file directory path
 * @param {String} [className] - optional css class
 * @param {*} [props] - other attributes to pass to `<img>`
 * @returns {Object} - React component
 */
function Image ({
  name,
  path,
  className = '',
  ...props
}) {
  return (
    <img
      src={imageSrc({name, path})}
      alt={fileNameWithoutExt(name)}
      className={classNames('app__image', className)}
      {...props}
    />
  )
}

Image.propTypes = {
  name: PropTypes.string.isRequired,
  path: PropTypes.string,
  className: PropTypes.string,
}

export function imageSrc ({avatar, src, name = '', path = FILE.PATH_IMAGES}) {
  return avatar || src || (path + name.replace(/\s/g, '-').toLowerCase())
}

export default React.memo(Image)
