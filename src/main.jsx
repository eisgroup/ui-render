import App from './App'
import {BrowserRouter} from 'react-router-dom'
import React from 'react'
import { render } from 'react-dom'
import { AppProvider } from './core/providers'

const baseName = process.env.REACT_APP_BASE_NAME || '/'

render(
    <AppProvider>
        <BrowserRouter basename={baseName}>
            <App />
        </BrowserRouter>
    </AppProvider>,
    document.getElementById('ui-render')
)
