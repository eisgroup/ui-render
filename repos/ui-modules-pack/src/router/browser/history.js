import { Active } from 'ui-utils-pack'

// history requires DOM and will throw error in Node when used with Next.js
// thus need to do conditional check before importing
export const history = Active.history = typeof window !== 'undefined' ? require('history').createBrowserHistory() : {}
export default history
