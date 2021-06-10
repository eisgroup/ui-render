# Rating Details npm package

This repository contains production bundles of Rating Details (using UI Render as the rending engine).

## Installation

1. Install the package from Nexus private npm:
   (you may need to setup `.npmrc` with your EIS account credentials first)

```shell
yarn add @eisgroup/rating-details
```

2. Import Rating Details into React UI:

```jsx
import RatingDetails from '@eisgroup/rating-details'
//...
const {productId} = this.props
return (
        <RatingDetails
                dataUrl={`https://dxp.api/product/data/${productId}`}
                metaUrl={`https://dxp.api/product/ui/${productId}`}
        />
)
```
