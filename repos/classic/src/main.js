import WebStudioPage from 'core/src/pages/main/webstudio'
import Redux from 'ui-modules-pack/redux'
import React from 'react'
import { render } from 'react-dom'
import AppElement from './AppElement'
import store from './store'

/**
 * ROOT APP VIEW ===============================================================
 * =============================================================================
 */

render(
  <Redux.Provider store={store}>
    <AppElement>
      <WebStudioPage/>
    </AppElement>
  </Redux.Provider>
  , document.getElementById('ui-render')
)
