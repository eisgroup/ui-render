# UI Render npm package

This repository contains production bundles of UI Render that can be integrated to any website using React.js.

## Installation

Install the package from public npm to your project:

```shell
yarn add eis-ui-render
```

## Integration

There are two ways to integrate UI Render:

### 1. Using `dataUrl` and `metaUrl` strings

- UI Render handles all `data/meta` fetching and updates for you

```tsx
// Simplified example integration with UI Builder as custom Component Slot
import React, {useMemo} from 'react'
import {environment} from '@eisgroup/common'
import {RatingReportNoData} from './components'
import {PREFIX} from '../../common/classNames'

// You can name `UIRender` as whatever you like
import UIRender from 'eis-ui-render'

export namespace RatingReportSlotClasses {
    const RATING_REPORT = 'rating-report-slot'
    export const CONTAINER = `${PREFIX}-${RATING_REPORT}`
}

export enum ProductCodes {
    STDMaster = 'STDMaster',
    SMPMaster = 'SMPMaster',
    LeaveMaster = 'LeaveMaster',
    ACCMaster = 'ACCMaster',
    GPLUMaster = 'GPLUMaster',
    LTDMaster = 'LTDMaster'
}

export interface RatingReportProps {
    revisionNo: number
    policyNumber: string
    productCode: ProductCodes
    isRated: boolean
}


const dxpBasePath = (environment && environment.dxp && environment.dxp.basePath) || ''
const styleUiRender = {width: '100%', marginBottom: 30, minHeight: 320}
const MAPPED_URL_BY_PRODUCT_CODE = {
    [ProductCodes.STDMaster]: 'backoffice-rating-std-master'
}
const getUrl = (productCode: ProductCodes) => MAPPED_URL_BY_PRODUCT_CODE[productCode]

const RatingReport = ({revisionNo, policyNumber, productCode, isRated = false}: RatingReportProps) => {
    const url = useMemo(() => getUrl(productCode), [productCode])
    return (
        <div className={RatingReportSlotClasses.CONTAINER}>
            {!isRated ? (
                <RatingReportNoData/>
            ) : (
                <UIRender
                    style={styleUiRender}
                    dataUrl={`${dxpBasePath}/${url}/v1/policies/${policyNumber}/${revisionNo}/rating-details`}
                    metaUrl={`${dxpBasePath}/${url}/v1/ui-config/generate-page-structure`}
                />
            )}
        </div>
    )
}

export const RatingReportSlot = RatingReport
```

### 2. Using UIRender directly with `data` and `meta` JS objects

 - With this approach you need to write your own logic to handle `data/meta` fetching and updating UI Render when
   User submits data back to backend. Check
   this [wrapper component](https://github.com/eisgroup/ui-render/blob/master/repos/core/src/pages/eis/webstudio.js)
   for example.
 - You must provide all props like the example code below:

```tsx
// This is as the same as: import UIRender from 'eis-ui-render'
import {UIRender} from 'eis-ui-render'

export function CashReports () {
   //...your code logic
   // Note: `initialValues` is required initially, and to reset all Form values inside UI Render
   return <UIRender data={data} meta={meta} initialValues={data} onSubmit={handleSubmit}/>
}

/**
 * Function called whenever User clicks on submit button inside UI Render
 * @param {Object|Any} formValues - this is `data` object passed to <UIRender/> with User updated values
 * @returns {void}
 */
function handleSubmit(formValues) {
    //...your code logic
    // You can use it to update `data`, `initialValues`, or `meta` sent to <UIRender/>,
    // or ignore it, in which case User clicking submit button will not change anything in UI Render.
}
```

## Build & Deploy Steps

Due to limitations in Genesis UI (no static asset folder), the build of this package has to be done and deployed manually:

1. Clone this package `git clone https://github.com/eisgroup/ui-render.git`
2. Inside `/repos/npm/` run `yarn build`
3. Then navigate to `/repos/policy/` folder and follow `README.md` instructions
4. Copy generated `/repos/policy/dist/static` folder to `/repos/npm/dist/static`
5. Add `/repos/npm/dist/.npmrc` with the content `//registry.npmjs.org/:_authToken=<npm_your_private_tocken>`
6. From single terminal instance login to npm `npm login` and publish to npm: `npm run push`
