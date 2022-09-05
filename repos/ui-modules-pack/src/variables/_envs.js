import { __CLIENT__, __PROD__, Active, ENV } from 'ui-utils-pack'

/* Platform Prefixes */
export const SERVICE = {
  API: 'API',
  BOT: 'BOT',
  CLIENT: 'CLIENT',
  DESKTOP: 'DESKTOP',
  MOBILE: 'MOBILE',
  SERVER: 'SERVER',
  WEB: 'WEB',
}

/* Additional Environment Variables */
export const SECRET = __PROD__ ? ENV.SECRET : ENV.REACT_APP_SECRET  // make backend use REACT for testing socket actions

/* Additional Globally Accessible Objects */
Active.SERVICE = ENV.SERVICE || (__CLIENT__ ? SERVICE.CLIENT : SERVICE.SERVER)
Active.state = undefined  // current Store State
Active.store = {}  // Redux Store
Active.createStore = () => {} // to create a new store instance within sagas without importing `redux` module
Active.client = undefined // Apollo client
Active.passwordCheck = () => {} // password strength calculator
Active.pubsub = undefined // GraphQL Pubsub module
Active.usersById = {} // for storing temporary info, like user.lastOnline
