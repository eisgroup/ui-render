import chalk from 'chalk' // causes `ansi-styles` module not found error inside Docker container if not installed
import { SERVER } from 'core/src/common/variables'
import localStorage from 'node-persist' // adds about 318 KB to final js bundle
import { Active } from 'utils-pack'
// import passwordChecker from 'zxcvbn' // adds 800 KB to bundle size, consider loading with script tag
import pubsub from './common/pubsub'

/**
 * SERVICE INITIALISATION ======================================================
 * Must be called first before other imports
 * =============================================================================
 */

// Active.passwordCheck = passwordChecker
if (!Active.SERVICE) Active.SERVICE = SERVER
if (!Active.log) Active.log = chalk
if (!Active.pubsub) Active.pubsub = pubsub
if (!Active.storage) Active.storage = localStorage
localStorage.init() // initiate local storage as async method for backend to avoid blocking concurrent processes
// localStorage.init({
//   // dir: 'data',  // always seem to throw permission errors on MacOs
//   stringify: CircularJSON.stringify, // throws error on webpack prod build
//   parse: CircularJSON.parse
// })
// if (!Active.WebSocket) Active.WebSocket = require('ws')
