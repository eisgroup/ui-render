// history requires DOM and will throw error in Node when used with Next.js
// thus need to do conditional check before importing
export const history = typeof window !== 'undefined' ? require('history').createBrowserHistory() : {}
export default history

export function openModal (route, state = {}) {
  if (window.innerWidth <= 375) state.classNameModal = 'full-screen no-radius ' + (state.classNameModal || '')
  return history.push({pathname: route, state: {isModal: true, ...state}})
}
