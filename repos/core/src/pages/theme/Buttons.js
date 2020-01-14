import React, { Component } from 'react'
import Button from '../../components/Button'
import Row from '../../components/Row'
import View from '../../components/View'

/**
 * Button States
 */
export default class Buttons extends Component {
  render () {
    return (
      <View className='full-width'>
        {/* Standard */}
        <Row className='wrap middle margin-v-smaller spread'>
          <Button className='primary'>Primary</Button>
          <Button className='primary large'>Large</Button>
          <Button className='primary small'>Small</Button>
        </Row>

        {/* Disabled */}
        <Row className='wrap middle margin-v-smaller spread'>
          <Button disabled className='primary'>Primary</Button>
          <Button disabled className='primary large'>Large</Button>
          <Button disabled className='primary small'>Small</Button>
        </Row>

        {/* Loading */}
        <Row className='wrap middle margin-v-smaller spread'>
          <Button loading className='primary'>Primary</Button>
          <Button loading className='primary large'>Large</Button>
          <Button loading className='primary small'>Small</Button>
        </Row>

        {/* Transparent */}
        <Row className='wrap middle margin-v-smaller spread'>
          <Button className='transparent'>Transparent</Button>
          <Button className='transparent large'>Large</Button>
          <Button className='transparent small'>Small</Button>
        </Row>
      </View>
    )
  }
}
