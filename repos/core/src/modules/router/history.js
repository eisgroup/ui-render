const history = require('history').createBrowserHistory()
export default history

export function openModal (route, state) {
  return history.push({pathname: route, state: {isModal: window.innerWidth > 375, ...state}})
}
