import React, { Component } from 'react'
import { DEFAULT } from 'ui-modules-pack/variables'
import Modal from 'ui-react-pack/Modal'
import Row from 'ui-react-pack/Row'
import { UIContext } from 'ui-react-pack/utils'
import View from 'ui-react-pack/View'
import { debounceBy, get, log, TIME_DURATION_INSTANT } from 'ui-utils-pack'
import Sidebar, { Header } from './demo/components/Navigation'
import Routes from './demo/routes'

// const mapStateToProps = (state) => ({
//   lang: select.language(state),
//   currency: select.currency(state),
//   theme: select.theme(state)
// })

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
        this.setState({ isMobile, screenRatio })
    }

    scrollToTop = () => {
        this.content.current.scrollIntoView({ behavior: 'auto' })
    }

    UNSAFE_componentWillReceiveProps (nextProps) {
        window.prevLocation = this.props.location

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
        const { children, lang = DEFAULT.LANGUAGE, currency, ...props } = this.props
        const { isMobile } = this.state

        return (
            <UIContext.Provider value={this.state}>
                <View className={`app fade-in lang--${lang} ${currency}`}>
                    {/* Header */}
                    <Header isMobile={isMobile} {...props} />

                    <Row fill reverse={isMobile} className="max-size">
                        {/* Sidebar */}
                        <Sidebar isMobile={isMobile} {...props}/>

                        {/* Content */}
                        <View className="app__content">
                            <div ref={this.content}/>

                            <Routes/>

                            {/* Modal */}
                            {this.isModal && this.renderModal()}
                        </View>

                    </Row>
                </View>
            </UIContext.Provider>
        )
    }
}
