import { Active, namespace } from 'utils-pack'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

export const UPLOAD = 'UPLOAD' // namespace this module
export const UPLOAD_SERVER = namespace(UPLOAD, Active.SERVICE) // Namespace this module for backend
