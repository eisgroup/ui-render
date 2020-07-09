import { GET, performStorage } from 'utils-pack'
import { NAME } from './constants'

/**
 * STATE DATA ==================================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */

const initState = {
  self: {
    ...performStorage(GET, NAME),
  },
  isLoading: false
}

export default initState
