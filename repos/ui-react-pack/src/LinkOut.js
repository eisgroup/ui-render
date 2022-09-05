import React from 'react'
import { type } from './types'

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
  to: type.UrlOrBase64OrPreview.isRequired,
  children: type.Any.isRequired,
}

export default React.memo(LinkOut)
