Reusable React Components

# Installation

```bash
yarn add react-ui-pack
```

## 1. Initial Setup
```js
import { files, styles } from 'react-ui-pack'

files.PATH_IMAGES = '/static/img' // default is `/static/images`
styles.ANIMATION_DURATION = 300 // default is 500
styles.GREEN = 'rgb(55, 145, 75)' // set green color
styles.PRIMARY = styles.GREEN // set primary color to green
styles.SECONDARY = styles.RED
```

## 2. Use Components
```js
import Table from 'react-ui-pack/Table'
```
