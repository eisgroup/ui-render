import React from 'react'
import Row from './core/components/Row'
import View from './core/components/View'
import Routes from './demo/routes'
import { ConfigContext } from './core/contexts'

const App = () => {
    const { currency, language } = React.useContext(ConfigContext)

    return (
        <View className={`app fade-in lang--${language} ${currency}`}>
            <Row fill className="max-size">
                <View className="app__content">
                    <Routes/>
                </View>
            </Row>
            <div id="render-popup-root" />
        </View>
    )
}

export default App