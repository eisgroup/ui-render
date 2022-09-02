import { Active } from 'ui-utils-pack'
import { namespace } from 'ui-utils-pack/utility'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const MEASUREMENT = 'MEASUREMENT' // Namespace this module
export const MEASUREMENT_SERVER = namespace(MEASUREMENT, Active.SERVICE) // Namespace this module for backend
