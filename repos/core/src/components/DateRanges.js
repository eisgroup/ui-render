import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { toDateRange } from '../common/utils'
import Icon from './Icon'
import Dates from './inputs/Dates'
import Text from './Text'

/**
 * Show Date Ranges as short string, with option to expand for details
 */
export default function DateRanges
  ({
    start,
    end,
    times,
    className,
    style,
    children,
    ...props
  }) {
  const [isString, toggleDisplay] = useState(true)
  const hasDetails = times.length > 0
  return (
    <>
      <Text className={classNames('app__date-ranges p', className)} style={style}>
        <Icon name='clock'/>
        {isString && toDateRange(start, end)}
        {hasDetails &&
        <Text
          key={isString}
          className={'a' + (isString ? ' margin-left-smaller' : '')}
          onClick={() => toggleDisplay(!isString)}>
          {(isString ? '- show hours' : 'Show less')}
        </Text>}
        {children}
      </Text>
      {!isString && hasDetails && <Dates value={times} readOnly {...props}/>}
    </>
  )
}

DateRanges.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  times: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.number,
    to: PropTypes.number,
  })),
  className: PropTypes.string,
  style: PropTypes.string,
  children: PropTypes.any,
}

