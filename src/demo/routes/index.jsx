import React from 'react'
import NavTabs from '../components/NavTabs'
import { Route, Routes as RoutesDom } from 'react-router-dom'

const Routes = () => {
    return (
        <RoutesDom>
            <Route exact path="*" element={<NavTabs />} />
        </RoutesDom>
    )
}

export default Routes