import { Active, capitalize } from 'ui-utils-pack'
import { namespace } from 'ui-utils-pack/utility'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const PLACE = 'PLACE' // Namespace this module
export const PLACE_SERVER = namespace(PLACE, Active.SERVICE) // Namespace this module for backend
export const PLACE_MODEL = capitalize(PLACE) // db Model name (Capitalized)
