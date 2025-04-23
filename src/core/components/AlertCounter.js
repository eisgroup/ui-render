import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Active } from 'ui-utils-pack'
import Badge from './Badge'
import { SOUND } from './files'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Notification Counter Icon
 * @Usage: to be wrapped using @withGql decorator
 * -----------------------------------------------------------------------------
 */
export default class AlertCounter extends PureComponent {
  static propTypes = {
    alert: PropTypes.number.isRequired,
  }

  static defaultProps = {
    alert: 0
  }

  componentDidUpdate (prev) {
    if (prev.alert < this.props.alert && Active.SETTINGS.HAS_SOUND) SOUND.ALERT.play()
  }

  render () {
    return <Badge className='alert__counter' count={this.props.alert}/>
  }
}
