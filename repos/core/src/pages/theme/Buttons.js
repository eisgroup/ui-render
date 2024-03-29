import classNames from 'classnames'
import React, { Component } from 'react'
import Button from 'ui-react-pack/Button'
import Icon from 'ui-react-pack/Icon'
import Row from 'ui-react-pack/Row'
import View from 'ui-react-pack/View'

/**
 * Button States
 */
export default class Buttons extends Component {
  renderButtonGroups = ({className, children, ...props}) => (<View className='margin'>
    {/* Default */}
    <Row className='wrap middle margin-v-smaller spread'>
      <Button className={classNames('large', className)} {...props}>{children || 'Large'}</Button>
      <Button className={classNames(className)} {...props}>{children || className || 'Default'}</Button>
      <Button className={classNames('small', className)} {...props}>{children || 'Small'}</Button>
    </Row>

    {/* Disabled */}
    <Row className='wrap middle margin-v-smaller spread'>
      <Button disabled className={classNames('large', className)} {...props}>{children || 'Large'}</Button>
      <Button disabled className={classNames(className)} {...props}>{children || className || 'Default'}</Button>
      <Button disabled className={classNames('small', className)} {...props}>{children || 'Small'}</Button>
    </Row>

    {/* Loading */}
    <Row className='wrap middle margin-v-smaller spread'>
      <Button loading className={classNames('large', className)} {...props}>{children || 'Large'}</Button>
      <Button loading className={classNames(className)} {...props}>{children || className || 'Default'}</Button>
      <Button loading className={classNames('small', className)} {...props}>{children || 'Small'}</Button>
    </Row>
  </View>)

  render () {
    return (
      <Row className='full-width center wrap'>
        <View className='margin'>
          {this.renderButtonGroups({className: 'primary'})}
          {this.renderButtonGroups({className: 'primary round'})}
          {this.renderButtonGroups({className: 'primary', circle: true, children: <Icon name='heart'/>})}
        </View>
        <View className='margin'>
          {this.renderButtonGroups({className: 'secondary'})}
          {this.renderButtonGroups({className: 'secondary round'})}
          {this.renderButtonGroups({className: 'secondary', circle: true, children: <Icon name='heart'/>})}
        </View>
        <View className='margin'>
          {this.renderButtonGroups({name: 'Default'})}
          {this.renderButtonGroups({name: 'Default', className: 'round'})}
          {this.renderButtonGroups({name: 'Default', circle: true, children: <Icon name='heart'/>})}
        </View>
      </Row>
    )
  }
}
