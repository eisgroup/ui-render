import { SERVICE } from 'modules-pack'
import { namespace } from 'utils-pack/utility'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const _TEMPLATE = '_TEMPLATE' // Namespace this module
export const _TEMPLATE_CLIENT = namespace(_TEMPLATE, SERVICE.CLIENT) // Namespace this module for frontend
export const _TEMPLATE_SERVER = namespace(_TEMPLATE, SERVICE.SERVER) // Namespace this module for backend
