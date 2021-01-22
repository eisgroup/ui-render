import { SERVICE } from 'modules-pack/variables'
import { namespace } from 'utils-pack/utility'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const COMMON = 'COMMON' // Namespace this module
export const COMMON_SERVER = namespace(COMMON, SERVICE.SERVER) // Namespace this module for backend
