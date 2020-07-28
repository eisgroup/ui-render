// import Apollo from 'core/src/apollo'
import App from 'core/src/App'
import Redux from 'modules-pack/redux'
import router from 'modules-pack/router'
import { ROUTE, ROUTES } from 'modules-pack/variables'
import React from 'react'
import { render } from 'react-dom'
import pages from './pages'
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
  , document.getElementById('react-app')
)
history.push(ROUTE.HOME)
