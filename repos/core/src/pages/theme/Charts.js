import React, { Component } from 'react'
import PieChart from '../../components/charts/PieChart'
import Row from '../../components/Row'
import View from '../../components/View'

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

        {/* Pie Chart */}
        <Row className='fill--width center wrap'>
          <PieChart unit='View' items={pieItems}/>
          <PieChart unit='View' items={pieItems} hasRef/>
        </Row>
      </View>
    )
  }
}
