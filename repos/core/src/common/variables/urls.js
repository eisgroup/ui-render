import { ENV } from './_envs'

/* API Endpoints */
export const API_URL = ENV.REACT_APP_API_URL || ''
export const API_TEST_URL = 'https://ipapi.co/json'
export const API_GQL_URI = '/gql'
export const API_GQL_URL = API_URL + API_GQL_URI
export const URL_LOGIN = `${API_URL}/login`
export const URL_LOGIN_REFRESH = `${API_URL}/refresh`
export const URL_LOGOUT = `${API_URL}/logout`
export const SOCKET_SERVER = `${ENV.SOCKET_PROTOCOL}://${ENV.SOCKET_HOST}${ENV.SOCKET_PORT ? ':' + ENV.SOCKET_PORT : ''}`
