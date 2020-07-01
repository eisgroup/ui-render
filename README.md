Reusable React Components

# Installation

```bash
yarn add components-react
```

## 1. Setup Styles
```js
import { styles } from 'components-react'

styles.ANIMATION_DURATION = 300 // default is 500
styles.GREEN = 'rgb(55, 145, 75)' // set green color
styles.PRIMARY = styles.GREEN // set primary color to green
styles.SECONDARY = styles.RED
```

## 2. Use Components
```js
import Table from 'components-react/src/Table'
```
