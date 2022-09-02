import { Active } from 'ui-utils-pack'
import { namespace } from 'ui-utils-pack/utility'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const _TEMPLATE = '_TEMPLATE' // Namespace this module
export const _TEMPLATE_CLIENT = namespace(_TEMPLATE, Active.SERVICE) // Namespace this module for frontend
export const _TEMPLATE_SERVER = namespace(_TEMPLATE, Active.SERVICE) // Namespace this module for backend
