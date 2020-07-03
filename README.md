Reusable React Components

# Installation

```bash
yarn add react-ui-pack
```

## 1. Initial Setup
```js
import { FILE, STYLE } from 'react-ui-pack'

FILE.PATH_IMAGES = '/static/img' // default is `/static/images`
STYLE.ANIMATION_DURATION = 300 // default is 500
STYLE.GREEN = 'rgb(55, 145, 75)' // set green color
STYLE.PRIMARY = STYLE.GREEN // set primary color to green
STYLE.SECONDARY = STYLE.RED
```

## 2. Use Components
```js
import Table from 'react-ui-pack/Table'
```
