import React from 'react'
import UIRender from '../core/pages/main/rules'
import { AppProvider } from '../core/providers'
import AppWrapper from './AppWrapper'

const Render = (props) => {
    return (
        <AppProvider>
            <AppWrapper>
                <UIRender {...props} />
            </AppWrapper>
        </AppProvider>
    )
}

export default Render