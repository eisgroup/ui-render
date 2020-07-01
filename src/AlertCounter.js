import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Badge from './Badge'
import { SOUND } from './files'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Notification Counter Icon
 * @Usage: to be wrapped using @withGql decorator
 * -----------------------------------------------------------------------------
 */
export default class AlertCounter extends Component {
  static propTypes = {
    alert: PropTypes.number.isRequired,
  }

  static defaultProps = {
    alert: 0
  }

  componentDidUpdate (prev) {
    if (prev.alert < this.props.alert) SOUND.ALERT.play()
  }

  render () {
    return <Badge className='alert__counter' count={this.props.alert}/>
  }
}
