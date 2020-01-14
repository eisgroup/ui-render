import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { Switch } from 'react-router-dom'
import { connect } from './common/redux'
import { debounceBy, get, log, logRender } from './common/utils'
import { ANALYTICS_TRACKING_ID, DEFAULT, TIME_DURATION_INSTANT } from './common/variables'
import Modal from './components/Modal'
import Row from './components/Row'
import { UIContext } from './components/utils'
import View from './components/View'
import Sidebar, { Header } from './containers/Navigation'
import { View as Popup } from './modules/popup'
import { select, SETTING } from './modules/settings'
import { View as CookiePolicy, withTracker } from './modules/tracking'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  lang: select.language(state),
  currency: select.currency(state),
  theme: select.theme(state)
})

@withRouter
@withTracker(ANALYTICS_TRACKING_ID)
@connect(mapStateToProps)
@logRender
export default class App extends Component {
  state = {
    isMobile: false,
    screenRatio: 1,
  }

  constructor (props) {
    super(props)
    this.content = React.createRef()
  }

  renderModal = () => {
    const {
      onModalClose = get(this, 'props.history.goBack') || (() => log('modal close')),
      canCloseModal = true,
      className
    } = get(this, 'props.location.state', {})
    // Modal.setAppElement('#root')  // hide content behind modal from screen readers
    return (
      <Modal
        isOpen
        canClose={canCloseModal}
        onClose={onModalClose}
        className={className}
      >{this.props.children}</Modal>
    )
  }

  @debounceBy(TIME_DURATION_INSTANT)
  resize () {
    const isMobile = window.innerWidth < 768
    const screenRatio = window.innerWidth / window.innerHeight
    this.setState({isMobile, screenRatio})
  }

  scrollToTop = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    this.content.current.scrollIntoView({behavior: 'auto'})
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    // Store Previous Location due react-router limitation
    window.prevLocation = this.props.location
    // Modal Logic
    // Change Router when Modal Opens and Go Back one Route when Modal Closes
    //
    // @example:
    //  @option 1:
    //    import { Link } from 'react-router';
    //    <Link to={{ pathname: '/login', state: { isModal: true, modalContentClass: 'some-class' } }}>
    //
    //  @option 2:
    //    import history from './history';
    //    history.push({ pathname: '/login', state: { isModal: true } })
    //
    //  @option 3 (inside Redux connected Container that uses 'react-router-redux'):
    //    render (
    //      const openLoginModal = this.props.router.push({ pathname: '/login', state: { isModal: true } })
    //      // ...
    //    )
    this.isModal = (
      nextProps.location.key !== this.props.location.key &&
      nextProps.location.state && nextProps.location.state.isModal
    )
    // Save the old location to display under
    if (this.isModal) this.previousLocation = this.props.location

    /* On Location Change */
    if (nextProps.location !== this.props.location) {
      this.scrollToTop()
    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.resize.bind(this))
    this.resize()
  }

  render () {
    const {children, theme = DEFAULT.THEME, lang = DEFAULT.LANGUAGE, currency, ...props} = this.props
    const {isMobile} = this.state
    const inverted = theme === SETTING.THEME.DARK
    return (
      <UIContext.Provider value={this.state}>
        <View className={`app fade-in lang--${lang} ${currency}` + (inverted ? ' inverted text-shadow' : '')}>
          <CookiePolicy/>

          {/* Header */}
          <Header isMobile={isMobile} {...props} />

          <Row fill reverse={isMobile} className='max-size'>
            {/* Sidebar */}
            <Sidebar isMobile={isMobile} {...props}/>

            {/* Content */}
            <View className='app__content'>
              <div ref={this.content}/>
              <Switch location={this.isModal ? this.previousLocation : this.props.location}>{children}</Switch>

              {/* Modal */}
              {this.isModal && this.renderModal()}

              {/* Popup */}
              <Popup inverted={inverted}/>
            </View>

          </Row>
        </View>
      </UIContext.Provider>
    )
  }
}
