// import Apollo from 'core/src/apollo'
import App from 'core/src/App'
import pages from 'core/src/pages'
import Redux from 'ui-modules-pack/redux'
import router from 'ui-modules-pack/router/browser'
import { ROUTES } from 'ui-modules-pack/variables'
import React from 'react'
import { render } from 'react-dom'
import store from './store'

/**
 * ROOT APP VIEW ===============================================================
 * =============================================================================
 */

const {Router, history} = router
render(
  // <Apollo.Provider client={Apollo.client}>
  <Redux.Provider store={store}>
    <Router history={history}>
      <App>
        {router.defineRoutes(ROUTES.FOR_DEFINITION, pages)}
        {/*<Route exact path={ROUTE.SETTINGS} component={settings.View}/>*/}
      </App>
    </Router>
  </Redux.Provider>
  // </Apollo.Provider>
  , document.getElementById('ui-render')
)
