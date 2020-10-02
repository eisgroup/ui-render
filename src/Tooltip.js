import classNames from 'classnames'
import React from 'react'

/**
 * Tooltip - Pure Component
 */
export function Tooltip ({top, bottom, right, left, show, className, ...props}) {
  return <span
    className={classNames('tooltip no-wrap', {top, bottom, right, left, show}, className)} {...props} />
}

export default React.memo(Tooltip)
