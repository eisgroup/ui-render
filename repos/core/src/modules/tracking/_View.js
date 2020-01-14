import React, { Component } from 'react'
import { ROUTE } from '../../common/variables'
import Button from '../../components/Button'
import Row from '../../components/Row'
import Text from '../../components/Text'
import View from '../../components/View'
import { Link } from '../router'
import { tracking } from './utils'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default class AcceptCookieView extends Component {
  state = {
    isOpen: tracking.showCookiePolicy
  }

  handleCookieAcceptance = () => {
    tracking.setCookieAcceptance()
    if (!tracking.showCookiePolicy) this.setState({isOpen: false})
  }

  render () {
    if (!this.state.isOpen) return null

    return (
      <View className='app__tracking bg-neutral position-bottom full-width border-top' style={{zIndex: 9}}>
        <Row className="wrap align-center padding">
          <Text className="p padding-small" style={{maxWidth: '100%'}}>
            Our site uses cookies. By continuing to use our site you are agreeing to our
            <Link to={ROUTE.PRIVACY}>Privacy Policy</Link>
          </Text>
          <Button
            className="small secondary basic"
            onClick={this.handleCookieAcceptance}
            style={{minWidth: 120}}
          >OK, I understand</Button>
        </Row>
      </View>
    )
  }
}
