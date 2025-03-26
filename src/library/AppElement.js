import React, { Component } from 'react'
import { Header } from '../core/containers/Navigation'
import { connect } from 'ui-modules-pack/redux'
import { select, SETTING } from 'ui-modules-pack/settings'
import { DEFAULT } from 'ui-modules-pack/variables'
import Row from 'ui-react-pack/Row'
import { UIContext } from 'ui-react-pack/utils'
import View from 'ui-react-pack/View'
import { debounceBy, TIME_DURATION_INSTANT } from 'ui-utils-pack'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  lang: select.language(state),
  currency: select.currency(state),
  theme: select.theme(state)
})

/**
 * ROOT VIEW WITHOUT ROUTER AND MODAL ------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps)
export default class AppElement extends Component {
  state = {
    isMobile: false,
    screenRatio: 1,
  }

  constructor (props) {
    super(props)
    this.content = React.createRef()
  }

  @debounceBy(TIME_DURATION_INSTANT)
  resize () {
    const isMobile = window.innerWidth < 768
    const screenRatio = window.innerWidth / window.innerHeight
    this.setState({isMobile, screenRatio})
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

          <Header isMobile={isMobile} {...props} />

          <Row fill reverse={isMobile} className='max-size'>

            <View className='app__content'>
              <div ref={this.content}/>
              {children}
            </View>

          </Row>
        </View>
      </UIContext.Provider>
    )
  }
}
