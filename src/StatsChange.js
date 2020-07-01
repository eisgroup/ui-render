import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { shortNumber, toPercentage } from 'utils-pack'
import Counter from './Counter'
import Icon from './Icon'
import Row from './Row'
import Text from './Text'
import View from './View'

/**
 * Stats with Percentage Difference and Optional Content Underneath
 */
export default function StatsChange ({start, end, children, className, render = shortNumber, ...props}) {
  const percentChange = toPercentage(end, start)
  return (
    <View className={classNames('app__stats-change', className)} {...props}>
      <Row className='bottom zoomin'>
        <Text className='largest bold margin-right'>{render(end)}</Text>
        <Row className='middle text large grey'>
          {percentChange > 0 && <Icon name='caret-up' className='green fade-in--slow'/>}
          {percentChange < 0 && <Icon name='caret-down' className='red fade-in--slow'/>}
          <Counter end={percentChange} render={percentChangeRenderer}/>%
        </Row>
      </Row>
      {children}
    </View>
  )
}

StatsChange.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  render: PropTypes.func, // number formatting function
  // @Note: see other <Counter> props
}

function percentChangeRenderer (number) {
  return Math.floor(Math.abs(number))
}
