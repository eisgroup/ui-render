import { __PROD__, Active, ENV } from 'utils-pack'

/* Additional Environment Variables */
export const SECRET = __PROD__ ? ENV.SECRET : ENV.REACT_APP_SECRET  // make backend use REACT for testing socket actions

/* Additional Globally Accessible Objects */
Active.SERVICE = ENV.SERVICE
Active.store = {}  // to avoid circular import
Active.createStore = () => {} // to create a new store instance within sagas
Active.client = undefined // Apollo client
Active.passwordCheck = () => {} // password strength calculator
Active.pubsub = undefined // GraphQL Pubsub module
Active.usersById = {} // for storing temporary info, like user.lastOnline
