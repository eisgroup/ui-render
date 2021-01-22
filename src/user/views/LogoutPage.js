import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { get, logRender } from '../../../common/utils'
import { _, APP_NAME, ROUTE } from '../../../common/variables'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon'
import Placeholder from '../../../components/Placeholder'
import Space from '../../../components/Space'
import Text from '../../../components/Text'
import history from '../../router/history'
import { resetUser } from '../actions'
import { withUserLogout } from '../requests'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Logout Page
 * -----------------------------------------------------------------------------
 */
@withUserLogout
@logRender
export default class LogoutPage extends Component {
  state = {
    loading: false,
  }

  componentDidMount () {
    const {logout} = this.props
    if (get(logout, 'id')) this.handleLogoutSuccess()
  }

  handleLogoutSuccess = () => {
    history.push(ROUTE.LOGIN)
    resetUser()
  }

  logout = () => {
    this.setState({loading: true})
    this.props.refetch()
      .then(r => {
        if (get(r, 'logout.id')) return this.handleLogoutSuccess()
        this.setState({loading: false})
        return r
      })
      .catch(() => {
        this.setState({loading: false})
      })
  }

  render () {
    const {loading} = this.state
    return (
      <Placeholder>
        <Helmet title={`${_.LOGOUT} ${_.ERROR} - ${APP_NAME}`}/>
        <Text className='h3 center error'>{_.CANNOT_LOG_OUT}</Text>
        <Text className='p center large margin-v'>{_.IT_SEEMS_ARE_YOU_ALREADY_LOGGED_OUT}</Text>
        <Button className='primary large round bg-white margin-v' onClick={this.logout} loading={loading}>
          <Text><Icon name='logout'/> {_.RETRY}</Text></Button>
        <Space/>
      </Placeholder>
    )
  }
}
