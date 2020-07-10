import { Link } from 'modules-pack/router'
import { ROUTE } from 'modules-pack/variables'
import React, { Component } from 'react'
import Button from 'react-ui-pack/Button'
import Row from 'react-ui-pack/Row'
import Text from 'react-ui-pack/Text'
import View from 'react-ui-pack/View'
import { tracking } from '../utils'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default class AcceptCookie extends Component {
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
            <Link to={ROUTE.PRIVACY} className='margin-left-smallest'>Privacy Policy</Link>
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
