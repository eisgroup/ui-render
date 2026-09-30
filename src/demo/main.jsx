import App from './App'
import {BrowserRouter} from 'react-router-dom'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from '../core/providers'

const baseName = process.env.REACT_APP_BASE_NAME || '/'

// The React 18 root API, not legacy `ReactDOM.render`: with the legacy call React 18 falls back to
// 17-compatible behaviour (no automatic batching), and the demo would stop representing what a host
// on 18 actually gets — which is the only reason the demo is a useful QA surface.
//
// Under StrictMode since §9.3 step 7, its acceptance: in development React renders twice and mounts,
// unmounts and mounts again, which is what surfaces a lifecycle that is not safe for concurrent
// rendering. `examples.strict-mode.test.js` pins that the corpus renders and behaves the same with
// it and without it.
createRoot(document.getElementById('ui-render')).render(
    <React.StrictMode>
        <AppProvider>
            <BrowserRouter basename={baseName}>
                <App />
            </BrowserRouter>
        </AppProvider>
    </React.StrictMode>
)
