import selector from '../../common/selector'
import { NAME } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(NAME)
export default class select {

  // Dropzone Files
  static files = () => [
    state => state[NAME].data.files,
    (val) => val || []
  ]

  static images = function () {
    return [
      this.files,
      (files) => files.filter(({ preview }) => !!preview)
    ]
  }

  static ui = () => [
    state => state[NAME].ui,
    (val) => val || {}
  ]
}
