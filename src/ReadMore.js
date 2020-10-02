import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import LinesEllipsis from 'react-lines-ellipsis'
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC'
import Text from './Text'
import View from './View'

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis)

export function ReadMore ({
  children,
  lines,
  more,
  less,
  rtl,
  className,
  style,
}) {
  const [expanded, toggleExpansion] = useState(false)
  return (
    <View className={classNames('app__read-more', className)} style={style}>
      {expanded
        ? <>
          <Text className='p'>{children}</Text>
          <Text className='p a' onClick={() => toggleExpansion(!expanded)}>{less}</Text>
        </>
        : <ResponsiveEllipsis
          text={children}
          maxLine={lines}
          ellipsis={<Text className='a' onClick={() => toggleExpansion(!expanded)}>{more}</Text>}
          trimRight={!rtl}
          basedOn='letters'
          className='p'
        />
      }
    </View>
  )
}

ReadMore.defaultProps = {
  lines: 3,
  more: '... read more',
  less: 'Show less',
}

ReadMore.propTypes = {
  children: PropTypes.string.isRequired,
  lines: PropTypes.number,
  more: PropTypes.string,
  less: PropTypes.string,
  rtl: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.string,
}

export default React.memo(ReadMore)
