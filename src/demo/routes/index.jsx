import React from 'react'
import NavTabs from '../components/NavTabs'
import TooltipHarness from '../pages/TooltipHarness'
import { Route, Routes as RoutesDom } from 'react-router-dom'

const Routes = () => {
    return (
        <RoutesDom>
            {/*
              Unlisted on purpose — deliberately absent from `NavTabs`'s tab list, so the published
              demo does not grow a page that only makes sense next to a spec file. It exists for
              e2e/harness.tooltip.pw.js (docs/UPGRADE-PLAN.md §9.5); the file header explains why the
              corpus cannot produce the geometry it captures. React Router v6 ranks routes by
              specificity rather than by order, so the `*` fallback below still catches everything
              else regardless of where this sits.
            */}
            <Route path="/harness/tooltip" element={<TooltipHarness />} />
            <Route exact path="*" element={<NavTabs />} />
        </RoutesDom>
    )
}

export default Routes
