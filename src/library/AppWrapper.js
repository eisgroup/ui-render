import React from 'react'
import Row from 'ui-react-pack/Row'
import View from 'ui-react-pack/View'
import { ConfigContext } from '../core/contexts'

const AppWrapper = ({ children }) => {
    const { currency, language } = React.useContext(ConfigContext)

    return (
        <div data-version='0.31.0' className={"ui-render"}>
            <View className={`app fade-in lang--${language} ${currency}`}>
                <Row fill className="max-size">
                    <View className="app__content">
                        {children}
                    </View>
                </Row>
                <div id="render-popup-root" />
            </View>
        </div>
    )
}

export default AppWrapper