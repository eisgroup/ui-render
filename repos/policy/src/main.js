// import Apollo from 'core/src/apollo'
import WebStudioPage from 'core/src/pages/eis/webstudio'
import Redux from 'modules-pack/redux'
import React from 'react'
import { render } from 'react-dom'
import AppElement from './AppElement'
import store from './store'

/**
 * ROOT APP VIEW ===============================================================
 * =============================================================================
 */

if (typeof window === 'undefined') {
  console.error(`window object is required for RatingDetails!`)
} else {
  window._renderRatingDetails = ({id, dataUrl, metaUrl}) => render(
    <Redux.Provider store={store}>
      <AppElement>
        <WebStudioPage dataUrl={dataUrl} metaUrl={metaUrl}/>
      </AppElement>
    </Redux.Provider>,
    document.getElementById(id)
  )
}
