import selector from 'utils-pack/selectors'
import { NAME as UPLOAD } from './constants'

/**
 * STATE SELECTORS =============================================================
 * Memoized Functions - to retrieve specific branches of the app state
 * =============================================================================
 */

@selector(UPLOAD)
export default class select {

  // Dropzone Files
  static files = () => [
    state => state[UPLOAD].files,
    (val) => val || []
  ]

  static images = function () {
    return [
      this.files,
      (files) => files.filter(({preview}) => !!preview)
    ]
  }

  static isLoading = () => [
    state => state[NAME].isLoading,
    (val) => val || {}
  ]
}
