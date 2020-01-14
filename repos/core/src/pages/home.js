import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { connect } from '../common/redux'
import { logRender } from '../common/utils'
import { APP_NAME } from '../common/variables'
import View from '../components/View'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({})
const mapDispatchToProps = () => ({
  actions: {}
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps, mapDispatchToProps)
@logRender
export default class Home extends Component {
  render () {
    return (
      <View fill className='app__page app__page--home fade-in'>
        <Helmet title={`${APP_NAME}`}/>
        <View fill className='max-height'>
          Home page
        </View>
      </View>
    )
  }
}
