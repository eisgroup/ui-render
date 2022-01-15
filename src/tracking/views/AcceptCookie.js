import { Link } from 'modules-pack/router/browser'
import { ROUTE_BASE } from 'modules-pack/variables/routes'
import React, { PureComponent } from 'react'
import { cn } from 'react-ui-pack'
import Button from 'react-ui-pack/Button'
import Row from 'react-ui-pack/Row'
import Text from 'react-ui-pack/Text'
import View from 'react-ui-pack/View'
import { __CLIENT__ } from 'utils-pack'
import { _ } from 'utils-pack/translations'
import { tracking } from '../utils'

/**
 * GDPR COOKIE NOTICE ----------------------------------------------------------
 * It is good for SEO to render GDPR notice with link to Privacy Policy
 * -----------------------------------------------------------------------------
 */
export default class AcceptCookie extends PureComponent {
  state = {
    isOpen: __CLIENT__ && tracking.showCookiePolicy,
  }

  handleCookieAcceptance = () => {
    tracking.setCookieAcceptance()
    if (!tracking.showCookiePolicy) this.setState({isOpen: false})
  }

  render () {
    const {isOpen} = this.state
    return (
      <View className={cn('app__tracking bg-neutral position-bottom full-width border-top', {hide: !isOpen})}
            style={styleTracker}>
        <Row className="wrap align-center padding text-highlight">
          <Text className="p padding-small" style={styleText}>
            {_.OUR_SITE_USES_COOKIES_BY_CONTINUING_TO_USE_OUR_SITE_YOU_ARE_AGREEING_TO_OUR}
            <Link to={ROUTE_PRIVACY} className="margin-left-smallest text-underline">{_.PRIVACY_POLICY}</Link>
          </Text>
          <Button className="small white round" onClick={this.handleCookieAcceptance} style={styleButton}
          >{_.OK_I_UNDERSTAND}</Button>
        </Row>
      </View>
    )
  }
}

const ROUTE_PRIVACY = `${ROUTE_BASE}privacy`
const styleButton = {minWidth: 120}
const styleTracker = {zIndex: 9}
const styleText = {maxWidth: '100%'}
