import { connect, stateAction } from 'modules-pack/redux'
import router from 'modules-pack/router'
import settings, { UI } from 'modules-pack/settings'
import React, { Component } from 'react'
import { cn, PropTypes, SOUND } from 'react-ui-pack'
import MenuButton from 'react-ui-pack/MenuButton'
import Row from 'react-ui-pack/Row'
import View from 'react-ui-pack/View'
import { SET } from 'utils-pack'
import { NAV_HEADER_MAX_LINKS } from '../common/variables'
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
@connect(mapStateToProps, mapDispatchToProps)
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
    if (!items.length) return null
    if (!isMobile) return null
    const hasSidebar = items.length > NAV_HEADER_MAX_LINKS
    const links = [...items]
    if (hasSidebar) links.length = NAV_HEADER_MAX_LINKS - 1
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
@connect(mapStateToProps, mapDispatchToProps)
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
    if (!items.length) return null
    const links = isMobile ? items.slice(NAV_HEADER_MAX_LINKS - 1) : items
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
