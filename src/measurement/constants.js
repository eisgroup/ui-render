import { SERVICE } from 'modules-pack/variables'
import { namespace } from 'utils-pack/utility'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const MEASUREMENT = 'MEASUREMENT' // Namespace this module
export const MEASUREMENT_SERVER = namespace(MEASUREMENT, SERVICE.SERVER) // Namespace this module for backend
