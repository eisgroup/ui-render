import React, { Component } from 'react'
import { connect } from '../common/redux'
import { SOUND } from '../common/variables'
import Badge from '../components/Badge'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = () => ({
  count: 9999, // todo: replace this with real alert count selector later
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Routed Navigation Links with Icon
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps)
export default class AlertCounter extends Component {
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.count > this.props.count) SOUND.ALERT.play()
  }

  render () {
    return <Badge className='app__alert__counter' count={this.props.count}/>
  }
}
