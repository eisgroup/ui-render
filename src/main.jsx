import App from './App'
import Redux from './core/modules/redux'
import {BrowserRouter} from 'react-router-dom'
import React from 'react'
import { render } from 'react-dom'
import store from './store'

const baseName = process.env.REACT_APP_BASE_NAME || '/'

render(
    <Redux.Provider store={store}>
        <BrowserRouter basename={baseName}>
            <App />
        </BrowserRouter>
    </Redux.Provider>,
    document.getElementById('ui-render')
)
