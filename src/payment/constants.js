import { SERVICE } from 'modules-pack/variables'
import { namespace } from 'utils-pack/utility'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const PAYMENT = 'PAYMENT' // Namespace this module
export const PAYMENT_SERVER = namespace(PAYMENT, SERVICE.SERVER) // Namespace this module for backend
