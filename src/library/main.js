import React, { PureComponent } from 'react'
import UIRender from '../core/pages/main/rules'
import { AppProvider } from '../core/providers'
import { render } from 'react-dom'
import { syncState } from 'ui-react-pack'
import AppElement from './AppElement'

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
        const { onMount } = this.props
        onMount && onMount(this) // pass this Class instance control to remote Component
    }

    render () {
        const { onMount, dataUrl, metaUrl, ...props } = this.state
        return <UIRender {...props}/>
    }
}

// Setup global method for UIRender.tsx to use for mounting to the DOM.
if (typeof window === 'undefined') {
    console.error(`window object is required for UIRender!`)
} else {
    // window._dataFetchMethod = 'GET'
    window._mountUIRender = ({ id, ...props }) => render(
        <AppProvider>
            <AppElement>
                <DOMProxy {...props}/>
            </AppElement>
        </AppProvider>,
        document.getElementById(id)
    )
}
