import React from 'react'
import { type } from './types'

/** The named props are read here; the rest is spread onto the `<a>`, unfiltered (see ./domProps). */
export type LinkOutProps = {
  /** URL to link to (href) */
  to: string
  /** Content */
  children: React.ReactNode
  [key: string]: unknown
}

/**
 * Link to external resources - Pure component
 *
 * @returns {Object} - React component
 */
export function LinkOut ({to, children, ...props}: LinkOutProps) {
  return (
    <a href={to} target='_blank' rel='noopener noreferrer' {...props}>{children}</a>
  )
}

LinkOut.propTypes = {
  to: type.UrlOrBase64OrPreview.isRequired,
  children: type.Any.isRequired,
}

export default React.memo(LinkOut)
