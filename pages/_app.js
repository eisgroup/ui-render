import { ACTIVE } from 'dux-utils'
import React from 'react'

// @Note: must use `typeof window === 'undefined'` for next.js to remove backend code from client
// @see: https://flaviocopes.com/nextjs-server-client-code/
if (typeof window === 'undefined') {
  ACTIVE.log = require('chalk')
}

export default function App ({Component, pageProps}) {
  return <Component {...pageProps} />
}
