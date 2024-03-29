import React, { Component } from 'react'
import PieChart from 'ui-react-pack/charts/PieChart'
import { renderCurrency } from 'ui-react-pack/renders'
import Row from 'ui-react-pack/Row'
import StatsChange from 'ui-react-pack/StatsChange'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'

/**
 * Charts
 */
export default class Charts extends Component {
  render () {
    const pieItems = [
      {label: 'Coca Cola Global Enterprise', value: 12435},
      {label: 'Diesel', value: 7409},
      {label: 'Sony', value: 108},
    ]
    return (
      <View className='full-width'>
        {/* Stats Change */}
        <Row className='center wrap'>
          <StatsChange start={11341} end={16345} className='margin'>
            <Text className='larger secondary margin-smaller'>Views Daily</Text>
          </StatsChange>
          <StatsChange start={18345} end={13245} render={renderCurrency} className='margin'>
            <Text className='larger primary margin-smaller'>Spend Daily</Text>
          </StatsChange>
        </Row>

        {/* Pie Chart */}
        <Row className='fill--width center wrap'>
          <PieChart unit='View' items={pieItems} pointers={false}/>
          <PieChart unit='View' items={pieItems}/>
          <PieChart unit='View' items={pieItems} legends/>
        </Row>
      </View>
    )
  }
}
