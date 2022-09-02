import { Active } from 'ui-utils-pack'
import { namespace } from 'ui-utils-pack/utility'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const PAYMENT = 'PAYMENT' // Namespace this module
export const PAYMENT_SERVER = namespace(PAYMENT, Active.SERVICE) // Namespace this module for backend
