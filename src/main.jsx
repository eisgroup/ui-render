import App from './core/App'
import pages from './core/pages'
import Redux from './core/modules/redux'
import router from './core/modules/router/browser'
import { ROUTES } from './core/modules/variables'
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
