import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect } from '../common/redux'
import { ANIMATION_DURATION, ROUTE } from '../common/variables'
import AlertCounter from '../components/AlertCounter'
import Icon from '../components/Icon'
import Text from '../components/Text'
import { withTimer } from '../components/utils'
import router, { Link } from '../modules/router'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  activeRoute: router.select.activeRoute(state),
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Routed Navigation Links with Icon
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps)
@withTimer
export default class NavLinks extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      path: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })).isRequired,
    onChangeRoute: PropTypes.func,
    sound: PropTypes.object, // sound file
  }

  itemDidMount = {}

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.sound && !this.props.sound) this.itemDidMount = {} // reset sound
  }

  render () {
    const {activeRoute, items, onChangeRoute, sound} = this.props
    return (
      <Fragment>
        {items.map(({path, name, icon}, i) => {
          const delay = (i + 1) * ANIMATION_DURATION * 0.3
          if (sound && !this.itemDidMount[i]) {
            this.setTimeout(sound.play, delay + 200)
            this.itemDidMount[i] = true
          }
          return (
            <Link
              key={path || i}
              to={{pathname: path}}
              className={'app__menu__item ' + (path === activeRoute ? 'active' : '')}
              disabled={path === activeRoute}
              onClick={onChangeRoute}
              style={{animationDelay: delay + 'ms'}}
            >
              <Icon name={icon}>{path === ROUTE.CHAT && <AlertCounter/>}</Icon><Text>{name}</Text>
            </Link>
          )
        })}
      </Fragment>
    )
  }
}
