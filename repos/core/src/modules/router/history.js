const history = require('history').createBrowserHistory()
export default history

export function openModal (route, state = {}) {
  if (window.innerWidth <= 375) state.classNameModal = 'full-screen no-radius ' + (state.classNameModal || '')
  return history.push({pathname: route, state: {isModal: true, ...state}})
}
