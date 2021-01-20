import { GET, performStorage } from 'utils-pack'
import { USER } from './constants'

/**
 * STATE DATA ==================================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */

const initState = {
  self: {
    // @Note: in backend, performStorage returns promise, and resolves to nothing,
    // but it does not matter, since only frontend needs to retrieve from localStorage.
    ...(typeof window === 'undefined') ? {} : performStorage(GET, USER),
  },
  loading: false
}

export default initState
