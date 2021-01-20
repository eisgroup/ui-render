import { GET, performStorage } from 'utils-pack'
import { USER } from './constants'

/**
 * STATE DATA ==================================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */

const initState = {
  self: {
    ...performStorage(GET, USER),
  },
  isLoading: false
}

export default initState
