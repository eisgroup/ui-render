import App from 'core/src/App'
import pages from 'core/src/pages'
import Redux from 'ui-modules-pack/redux'
import router from 'ui-modules-pack/router/browser'
import { ROUTES } from 'ui-modules-pack/variables'
import React from 'react'
import { render } from 'react-dom'
import store from './store'

const {Router, history} = router
render(
  <Redux.Provider store={store}>
    <Router history={history}>
      <App>
        {router.defineRoutes(ROUTES.FOR_DEFINITION, pages)}
      </App>
    </Router>
  </Redux.Provider>
  , document.getElementById('ui-render')
)
