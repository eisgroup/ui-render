import { __CLIENT__, ENV } from 'ui-utils-pack'

/* API Endpoints */
export const URI = {
  GQL: '/gql',
  GQL_SUBSCRIPTIONS: '/subscriptions',
}
export const URL = {
  API: ENV.API_URL || ENV.REACT_APP_API_URL || (__CLIENT__ ? window.location.origin : ''),
  API_TEST: 'https://ipapi.co/json',
  CDN: ENV.REACT_APP_CDN_URL || '',
  HOST: ENV.HOST_URL || ENV.REACT_APP_HOST_URL || (__CLIENT__ ? window.location.origin : (ENV.DOMAIN ? `//${ENV.DOMAIN}` : '')),
  SOCKET_SERVER: `${ENV.SOCKET_PROTOCOL}://${ENV.SOCKET_HOST}${ENV.SOCKET_PORT ? ':' + ENV.SOCKET_PORT : ''}`,
}

URL.API_GQL = `${URL.API}${URI.GQL}`
URL.LOGIN = `${URL.API}/login`
URL.LOGIN_REFRESH = `${URL.API}/refresh`
URL.LOGOUT = `${URL.API}/logout`
