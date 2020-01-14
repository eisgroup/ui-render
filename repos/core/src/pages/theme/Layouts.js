import React, { Component } from 'react'
import { PATH_IMAGES } from '../../common/variables'
import Icon from '../../components/Icon'
import Loading from '../../components/Loading'
import Row from '../../components/Row'
import Spinner from '../../components/Spinner'
import Square from '../../components/Square'
import View from '../../components/View'

/**
 * Layouts
 */
export default class Layouts extends Component {
  render () {
    const squareClass = 'bg-home align-center'
    return (
      <View fill className='full-width'>
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

        {/* asSquare */}
        <Row className='center wrap' style={{minHeight: 200, color: 'white'}}>
          <Square.View right className={squareClass}>Right View</Square.View>
          <Square.View className={squareClass}>Middle Center View</Square.View>
          <Square.View left className={squareClass}>Left View</Square.View>
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
