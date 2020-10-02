import PropTypes from 'prop-types'
import React from 'react'

/**
 * Link to external resources - Pure component
 *
 * @param {String} to - URL to link to (href)
 * @param {*} children - content
 * @param {*} [props] - other attributes to pass
 * @returns {Object} - React component
 */
export function LinkOut ({to, children, ...props}) {
  return (
    <a href={to} target='_blank' rel='noopener noreferrer' {...props}>{children}</a>
  )
}

LinkOut.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
}

export default React.memo(LinkOut)
