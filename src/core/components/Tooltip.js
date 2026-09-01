import classNames from '../utils/classNames'
import React from 'react'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/**
 * Tooltip - Pure Component
 */
export function Tooltip ({top, bottom, right, left, show, className, ...props}) {
  return <span
    // DOM boundary (see ./domProps): the spread lands on a generic <span>, so both lists apply.
    className={classNames('tooltip no-wrap', {top, bottom, right, left, show}, className)}
    {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)} />
}

export default React.memo(Tooltip)
