# Rating Details npm package

This repository contains production bundles of Rating Details (using UI Render as the rending engine).

## Installation

1. Install the package from Nexus private npm:
   (you may need to setup `.npmrc` with your EIS account credentials first)

```shell
yarn add @eisgroup/rating-details
```

2. Import Rating Details into React UI:

```tsx
import React, {useMemo} from 'react'
import {environment} from '@eisgroup/common'
import RatingDetails from '@eisgroup/rating-details'
import {RatingReportNoData} from './components'
import {PREFIX} from '../../common/classNames'

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
                <RatingDetails
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
