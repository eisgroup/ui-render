import { tracking } from 'ui-modules-pack/tracking/utils'
import React, { Component } from 'react'
import GoogleAnalytics from 'react-ga'

/**
 * =============================================================================
 * TRACKING FOR SINGLE PAGE APPLICATION USING REACT-GA
 * =============================================================================
 */

/**
 * Higher Order React Component Wrapper to enable Analytics
 * @param {String} trackingId - analytics tracking ID
 * @return {Function<WrappedComponent>} decorator function that accepts React Component
 */
export function withTracker (trackingId) {
  tracking.init(trackingId, initAnalytics)  // sets `userId` internally as `options`

  function trackPage (page) {
    if (!tracking.ga) return
    tracking.ga.pageview(page)
  }

  return function (WrappedComponent) {
    return class HOC extends Component {
      componentDidMount () {
        trackPage(this.props.location.pathname)
      }

      UNSAFE_componentWillReceiveProps (nextProps) {
        const currentPage = this.props.location.pathname
        const nextPage = nextProps.location.pathname
        if (currentPage !== nextPage) trackPage(nextPage)
      }

      render () {
        return <WrappedComponent {...this.props} />
      }
    }
  }
}

const initAnalytics = (trackingId, tracking) => {
  tracking.ga = GoogleAnalytics
  tracking.ga.initialize(trackingId)
  if (this.user) tracking.ga.set({userId: this.user})
}
