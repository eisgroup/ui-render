import Popup from 'modules-pack/popup/views/Popup'
import { connect } from 'modules-pack/redux'
import { Switch, withRouter } from 'modules-pack/router/browser'
import { select, SETTING } from 'modules-pack/settings'
import { DEFAULT } from 'modules-pack/variables'
import React, { Component } from 'react'
import Button from 'react-ui-pack/Button'
import Icon from 'react-ui-pack/Icon'
import Modal from 'react-ui-pack/Modal'
import Row from 'react-ui-pack/Row'
import { UIContext } from 'react-ui-pack/utils'
import View from 'react-ui-pack/View'
import { Active, debounceBy, get, log, logRender, TIME_DURATION_INSTANT } from 'utils-pack'
import Sidebar, { Header } from './containers/Navigation'

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
      classNameModal
    } = get(this, 'props.location.state', {})
    // Modal.setAppElement('#root')  // hide content behind modal from screen readers
    return (
      <Modal
        isOpen
        canClose={canCloseModal}
        onClose={onModalClose}
        className={classNameModal}
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
    //    <Link to={{ pathname: '/login', state: { isModal: true, classNameModal: 'bg-transparent' } }}>
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

  renderClosePopup = ({closePopup}) => {
    return Active.popupCLoseButton ||
      <View className="position-top-right padding-right-small padding-top-small" style={styleCloseButton}>
        <Button className="primary circle small" onClick={closePopup}><Icon name="close"/></Button>
      </View>
  }

  render () {
    const {children, theme = DEFAULT.THEME, lang = DEFAULT.LANGUAGE, currency, ...props} = this.props
    const {isMobile} = this.state
    const inverted = theme === SETTING.THEME.DARK
    return (
      <UIContext.Provider value={this.state}>
        <View className={`app fade-in lang--${lang} ${currency}` + (inverted ? ' inverted text-shadow' : '')}>
          {/*<AcceptCookie/>*/}

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
              <Popup canClose inverted={inverted} renderClose={this.renderClosePopup}/>
            </View>

          </Row>
        </View>
      </UIContext.Provider>
    )
  }
}

const styleCloseButton = {zIndex: 9}
