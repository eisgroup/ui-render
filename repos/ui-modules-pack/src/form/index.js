import { NAME } from './constants'
// import './renders' // to trigger all definitions

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

// export * from '../form/renders' // to set Active.Field definitions
export * from 'react-final-form'
export * from './constants'
export * from './utils'

const form = {
  NAME,
}

export default form
