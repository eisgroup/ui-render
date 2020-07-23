import App from 'core/src/App'
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
  <Redux.Provider store={store}>
    <Router history={history}>
      <App/>
    </Router>
  </Redux.Provider>
  , document.getElementById('root')
)
