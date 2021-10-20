import React from 'react'
import WebStudioPage from './webstudio'

// todo: remove - was used for testing mocked API
export default function PolicyPage () {
  return <WebStudioPage
    dataUrl='https://dxp-gateway-nightly.genci0.eisgroup.com/backoffice-rating-std-master/poc/details/policy1/1'
    metaUrl='https://dxp-gateway-nightly.genci0.eisgroup.com/backoffice-rating-std-master/v1/ui-config/generate-page-structure'
  />
}
