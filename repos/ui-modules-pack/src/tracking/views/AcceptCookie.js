import { Link } from 'ui-modules-pack/router/browser'
import { ROUTE_BASE } from 'ui-modules-pack/variables/routes'
import React, { PureComponent } from 'react'
import { cn } from 'ui-react-pack'
import Button from 'ui-react-pack/Button'
import Row from 'ui-react-pack/Row'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { __CLIENT__ } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
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
