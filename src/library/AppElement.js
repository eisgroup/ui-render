import React from 'react'
import Row from 'ui-react-pack/Row'
import View from 'ui-react-pack/View'
import { ConfigContext } from '../core/contexts'

const AppElement = ({ children }) => {
    const { currency, language } = React.useContext(ConfigContext)

    return (
        <View className={`app fade-in lang--${language} ${currency}`}>
            <Row fill className="max-size">
                <View className="app__content">
                    {children}
                </View>
            </Row>
            <div id="render-popup-root" />
        </View>
    )
}

export default AppElement