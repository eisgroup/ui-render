import { connect } from 'ui-modules-pack/redux'
import { APP_NAME } from 'ui-modules-pack/variables'
import React, { Component } from 'react'
import Helmet from 'react-helmet'
import View from 'ui-react-pack/View'

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
