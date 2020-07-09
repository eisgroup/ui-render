import { CONNECTED, DISCONNECTED, ERROR, MESSAGE, REQUEST } from 'utils-pack'
import { SOCKET_CONNECT_TIMEOUT } from '../variables'

// =============================================================================
// CONSTANT VARIABLES
// =============================================================================

export const NAME = 'SOCKET'  // Namespace this module
export const SOCKET_CALL = `${NAME}_CALL`  // -> socket action identifier for middleware
export const SOCKET_CLOSE_EVENT = [1000, 'Closed by SocketMiddleware']
export const SOCKET_RESULTS = [REQUEST, CONNECTED, DISCONNECTED, ERROR, MESSAGE]
export const CONNECT_TIMEOUT = SOCKET_CONNECT_TIMEOUT
