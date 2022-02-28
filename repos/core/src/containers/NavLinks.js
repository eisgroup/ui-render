import { connect } from 'modules-pack/redux'
import router, { Link } from 'modules-pack/router/browser'
import { ROUTE } from 'modules-pack/variables'
import React, { Component, Fragment } from 'react'
import { PropTypes, STYLE } from 'react-ui-pack'
import AlertCounter from 'react-ui-pack/AlertCounter'
import Icon from 'react-ui-pack/Icon'
import Text from 'react-ui-pack/Text'
import { withTimer } from 'react-ui-pack/utils'

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
          const delay = (i + 1) * STYLE.ANIMATION_DURATION * 0.3
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
