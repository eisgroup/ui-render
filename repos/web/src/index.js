// This must be the first line in src/index.js
import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import 'core/src/common/variables'
import './main'
import * as serviceWorker from './serviceWorker'
// import './zxcvbn'

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
