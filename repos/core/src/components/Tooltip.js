import classNames from 'classnames'
import React from 'react'

/**
 * Tooltip - Pure CSS Component
 */
export default function Tooltip ({ top, bottom, right, left, show, className, ...props }) {
  return <span
    className={classNames('tooltip no-wrap', { top, bottom, right, left, show }, className)} {...props} />
}
