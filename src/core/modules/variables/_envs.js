import { __CLIENT__, Active, ENV } from 'ui-utils-pack'

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

/* Additional Globally Accessible Objects */
Active.SERVICE = ENV.SERVICE || (__CLIENT__ ? SERVICE.CLIENT : SERVICE.SERVER)
Active.state = undefined  // current Store State
Active.passwordCheck = () => {} // password strength calculator
Active.usersById = {} // for storing temporary info, like user.lastOnline
