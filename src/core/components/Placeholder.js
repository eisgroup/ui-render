import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import View from './View'

/**
 * Placeholder - Pure Component.
 */
export function Placeholder ({className, ...props}) {
  return <View
    fill
    className={classNames('bg-texture-faded full-screen middle center fade-in-up padding-largest', className)}
    {...props}
  />
}

Placeholder.propTypes = {
  children: PropTypes.any.isRequired
}

export default React.memo(Placeholder)
