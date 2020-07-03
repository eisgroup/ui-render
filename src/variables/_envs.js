import { __PROD__, ACTIVE, ENV } from 'utils-pack'

/* Additional Environment Variables */
export const SECRET = __PROD__ ? ENV.SECRET : ENV.REACT_APP_SECRET  // make backend use REACT for testing socket actions

/* Additional Globally Accessible Objects */
ACTIVE.SERVICE = ENV.SERVICE
ACTIVE.store = {}  // to avoid circular import
ACTIVE.createStore = () => {} // to create a new store instance within sagas
ACTIVE.client = undefined // Apollo client
ACTIVE.passwordCheck = () => {} // password strength calculator
ACTIVE.pubsub = undefined // GraphQL Pubsub module
ACTIVE.usersById = {} // for storing temporary info, like user.lastOnline
