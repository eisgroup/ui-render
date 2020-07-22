import React, { Component } from 'react'
import Icon from 'react-ui-pack/Icon'
import Loading from 'react-ui-pack/Loading'
import Row from 'react-ui-pack/Row'
import Spinner from 'react-ui-pack/Spinner'
import Square from 'react-ui-pack/Square'
import View from 'react-ui-pack/View'
import { PATH_IMAGES } from '../../common/variables'

/**
 * Layouts
 */
export default class Layouts extends Component {
  render () {
    const squareClass = 'bg-home align-center fill'
    return (
      <View fill className='full-width'>

        {/* asSquare */}
        <Row className='center wrap' style={{minHeight: 200, color: 'white'}}>
          <Square.View right className={squareClass}>Square.View right</Square.View>
          <Square.View className={squareClass}>Square.View</Square.View>
          <Square.Row left className={squareClass}>Square.Row left</Square.Row>
        </Row>

        {/* asSquare with dimensions */}
        <Row className='center wrap' style={{minHeight: 200, color: 'white'}}>
          <Row fill className='border'>
            <Square.View left className={squareClass}>Square.View Left</Square.View>
          </Row>
          <Square.View>
            <Row fill style={{color: 'white'}}>
              <View fill className='border'>
                <Square.Row top className={squareClass} width={1} height={2}>Row 1:2 Top</Square.Row>
              </View>
              <View fill className='border'>
                <Square.Row className={squareClass} width={1} height={1}>Row 1:1</Square.Row>
              </View>
              <View fill className='border'>
                <Square.Row bottom className={squareClass} width={3} height={2}>Row 3:2 Bottom</Square.Row>
              </View>
            </Row>
          </Square.View>
          <View fill className='border'>
            <Square.Row right className={squareClass}>Square.Row Right</Square.Row>
          </View>
        </Row>

        {/* Square */}
        <Row className='center wrap' style={{minHeight: 200, color: 'white'}}>
          <Row fill className='border'>
            <Square left classNameInner={squareClass}>Left</Square>
          </Row>
          <Square>
            <Row fill style={{color: 'white'}}>
              <View fill className='border'>
                <Square top classNameInner={squareClass}>Top</Square>
              </View>
              <View fill className='border'>
                <Square classNameInner={squareClass}>Middle Center</Square>
              </View>
              <View fill className='border'>
                <Square bottom classNameInner={squareClass}>Bottom</Square>
              </View>
            </Row>
          </Square>
          <View fill className='border'>
            <Square right classNameInner={squareClass}>right</Square>
          </View>
        </Row>

        {/* Headers */}
        <h1>H1 Header with <Icon name='search'/>
          <small>small text inside</small>
        </h1>
        <h2>H2 Header with <Icon name='search'/>
          <small>small text inside</small>
        </h2>
        <h3>H3 Header with <Icon name='search'/>
          <small>small text inside</small>
        </h3>
        <h4>H4 Header with <Icon name='search'/>
          <small>small text inside</small>
        </h4>
        <h5>H5 Header with <Icon name='search'/>
          <small>small text inside</small>
        </h5>
        <h6>H6 Header with <Icon name='search'/>
          <small>small text inside</small>
        </h6>
        <p>
          <Icon name='edit'/> Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          Icons can be customised with
          <a href='https://icomoon.io/app/#/select' target='_blank' rel='noopener noreferrer'> icomoon </a>
          by uploading <code>src/web/style/fonts/icomoon/selection.json</code>
        </p>
        <Row>
          <Spinner size='smallest' className='margin-right-smaller'/>
          <a href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>Learn React the easy way</a>
        </Row>
        <View>
          <img src={PATH_IMAGES + 'logo.svg'} alt='logo'/>
          <Loading/>
        </View>
      </View>
    )
  }
}
