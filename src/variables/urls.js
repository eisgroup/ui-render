import { __CLIENT__, ENV } from 'utils-pack'

/* API Endpoints */
export const URI = {
  GQL: '/gql',
  GQL_SUBSCRIPTIONS: '/subscriptions',
}
export const URL = {
  API: ENV.API_URL || ENV.REACT_APP_API_URL || (__CLIENT__ ? window.location.origin : ''),
  API_TEST: 'https://ipapi.co/json',
  SOCKET_SERVER: `${ENV.SOCKET_PROTOCOL}://${ENV.SOCKET_HOST}${ENV.SOCKET_PORT ? ':' + ENV.SOCKET_PORT : ''}`
}

URL.API_GQL = `${URL.API}${URI.GQL}`
URL.LOGIN = `${URL.API}/login`
URL.LOGIN_REFRESH = `${URL.API}/refresh`
URL.LOGOUT = `${URL.API}/logout`
