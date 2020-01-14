import { GET } from '../../common/constants'
import { performStorage } from '../../common/utils'
import { NAME } from './constants'

/**
 * STATE DATA ==================================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */

const initState = {
  data: {
    ...performStorage(GET, NAME)
  },
  ui: {
    isLoading: false,
  }
}

export default initState
