import { connect } from 'modules-pack/redux'
import { APP_NAME } from 'modules-pack/variables'
import React, { Component } from 'react'
import Helmet from 'react-helmet'
import View from 'react-ui-pack/View'
import { logRender } from 'utils-pack'

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
