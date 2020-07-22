// import Apollo from 'core/src/apollo'
import App from 'core/src/App'
import { ROUTES } from 'core/src/common/variables'
import pages from 'core/src/pages'
import Redux from 'modules-pack/redux'
import router from 'modules-pack/router'
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
        {router.defineRoutes(ROUTES, pages)}
        {/*<Route exact path={ROUTE.SETTINGS} component={settings.View}/>*/}
      </App>
    </Router>
  </Redux.Provider>
  // </Apollo.Provider>
  , document.getElementById('root')
)
