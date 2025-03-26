import { connect, stateAction } from 'ui-modules-pack/redux'
import router from 'ui-modules-pack/router/browser'
import settings, { UI } from 'ui-modules-pack/settings'
import { ROUTES } from 'ui-modules-pack/variables'
import React, { Component } from 'react'
import { cn, PropTypes, SOUND } from 'ui-react-pack'
import MenuButton from 'ui-react-pack/MenuButton'
import Row from 'ui-react-pack/Row'
import View from 'ui-react-pack/View'
import { SET } from 'ui-utils-pack'
import NavLinks from './NavLinks'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  activeRoute: router.select.activeRoute(state),
  items: settings.select.routesForNav(state),
  isOpenSidebar: settings.select.isOpenSidebar(state),
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    set: (payload) => dispatch(stateAction(UI, SET, payload))
  }
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Header Navigation
 * -----------------------------------------------------------------------------
 */
// @connect(mapStateToProps, mapDispatchToProps)
export class Header extends Component {
  static propTypes = {
    isMobile: PropTypes.bool.isRequired, // whether the view is for mobile
  }

  handleToggleSidebar = () => {
    const { actions, isOpenSidebar } = this.props
    actions.set({ isOpenSidebar: !isOpenSidebar })
  }

  render () {
    const { isMobile, isOpenSidebar, items } = this.props
    // if (!items.length) return null
    if (!isMobile) return null
    const hasSidebar = items.length > ROUTES.NAV_HEADER_MAX_LINKS
    const links = [...items]
    if (hasSidebar) links.length = ROUTES.NAV_HEADER_MAX_LINKS - 1
    return (
      <Row className='app__header__items fill-width'>
        <NavLinks
          items={links}
          onChangeRoute={this.handleCloseSidebar}
        />
        {hasSidebar && <MenuButton active={isOpenSidebar} onClick={this.handleToggleSidebar}/>}
      </Row>
    )
  }
}

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Sidebar Navigation
 * -----------------------------------------------------------------------------
 */
// @connect(mapStateToProps, mapDispatchToProps)
export default class Sidebar extends Component {
  static propTypes = {
    isMobile: PropTypes.bool.isRequired, // whether the view is for mobile
  }

  handleCloseSidebar = () => {
    const {actions, isOpenSidebar} = this.props
    if (isOpenSidebar) actions.set({isOpenSidebar: !isOpenSidebar})
  }

  render () {
    const { isMobile, isOpenSidebar, className, items } = this.props
    // if (!items.length) return null
    const links = isMobile ? items.slice(ROUTES.NAV_HEADER_MAX_LINKS - 1) : items
    const showSidebar = !isMobile || isOpenSidebar
    const containerClass = showSidebar
      ? 'active' // do not add `fade-in` class because of Safari bug
      : (isOpenSidebar === false ? 'fade-out' : 'hide')
    const contentClass = showSidebar
      ? 'slide-in-right'
      : (isOpenSidebar === false ? 'slide-out-right' : 'hide')
    return (
      <Row className={cn('app__sidebar', containerClass, className)}>
        {/* Empty overlay in Mobile view */}
        {isMobile && <View className='fill no-outline' onClick={this.handleCloseSidebar} tabIndex={-2}/>}

        {/* Nav items */}
        <View className={cn('fill-height ', contentClass)}>
          <View className='overflow-scroll no-scrollbar'>
            <View className='app__sidebar__items min-height'>
              <NavLinks
                items={links}
                onChangeRoute={this.handleCloseSidebar}
                sound={showSidebar ? SOUND.SLIDE : undefined}
              />
            </View>
          </View>

          {/* Empty space between Nav items and the static links on the bottom */}
          <View className='app__menu__item--empty fill no-outline' onClick={isMobile && this.handleCloseSidebar}
                tabIndex={-2}/>
        </View>
      </Row>
    )
  }
}
