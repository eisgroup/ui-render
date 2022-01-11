// import Apollo from 'core/src/apollo'
import UIRender from 'core/src/pages/eis/rules'
import WebStudioPage from 'core/src/pages/eis/webstudio'
import Redux from 'modules-pack/redux'
import React, { PureComponent } from 'react'
import { render } from 'react-dom'
import { syncState } from 'react-ui-pack'
import AppElement from './AppElement'
import store from './store'

/**
 * ROOT APP VIEW ===============================================================
 * =============================================================================
 */

/**
 * React Component Wrapper to enable Multiple React instances in HTML DOM from Remote Component
 */
class DOMProxy extends PureComponent {
  state = {
    ...this.props
  }

  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    syncState(this.props, nextProps, this)
  }

  componentDidMount () {
    const {onMount} = this.props
    onMount && onMount(this) // pass this Class instance control to remote Component
  }

  render () {
    const {onMount, dataUrl, metaUrl, ...props} = this.state
    return (dataUrl && metaUrl)
      ? <WebStudioPage dataUrl={dataUrl} metaUrl={metaUrl}/>
      : <UIRender {...props}/>
  }
}

// Setup global method for UIRender.tsx to use for mounting to the DOM.
if (typeof window === 'undefined') {
  console.error(`window object is required for UIRender!`)
} else {
  window._dataFetchMethod = 'GET'
  window._mountUIRender = ({id, ...props}) => render(
    <Redux.Provider store={store}>
      <AppElement>
        <DOMProxy {...props}/>
      </AppElement>
    </Redux.Provider>,
    document.getElementById(id)
  )
}
