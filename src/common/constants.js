import { Active } from 'utils-pack'
import { namespace } from 'utils-pack/utility'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const COMMON = 'COMMON' // Namespace this module
export const COMMON_SERVER = namespace(COMMON, Active.SERVICE) // Namespace this module for backend
