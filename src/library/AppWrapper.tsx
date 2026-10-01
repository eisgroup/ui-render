import React from 'react'
import Row from '../core/components/Row'
import View from '../core/components/View'
import { AppContext, ConfigContext } from '../core/contexts'
import type { ConfigState } from '../core/contexts'

const AppWrapper = ({ children }: { children?: React.ReactNode }) => {
    // A cast, not a guard: `main` renders this inside `ConfigOverride`, which always publishes a value.
    const { currency, language } = React.useContext(ConfigContext) as ConfigState
    const app = React.useContext(AppContext)

    // Published as a NODE on the context rather than found by id. Two documents on one page each
    // render this element with the same id, so `document.getElementById` gave every popup to the
    // first one in the DOM — putting the second document's popup under the FIRST document's shell,
    // and therefore under its language and currency classes. Held in state because a ref is null on
    // the render that creates it, and the portal needs the element itself.
    const [popupRoot, setPopupRoot] = React.useState<HTMLElement | null>(null)
    const appWithRoot = React.useMemo(() => ({ ...app, popupRoot }), [app, popupRoot])

    return (
        <div data-version="0.34.3" className={"ui-render"}>
            <AppContext.Provider value={appWithRoot}>
                <View className={`app fade-in lang--${language} ${currency}`}>
                    <Row fill className="max-size">
                        <View className="app__content">
                            {children}
                        </View>
                    </Row>
                    {/* The id is kept: it is part of the shell a host sees, and nothing depends on
                        it any more for finding the root. */}
                    <div id="render-popup-root" ref={setPopupRoot} />
                </View>
            </AppContext.Provider>
        </div>
    )
}

export default AppWrapper