import * as definitions from './definitions'
import { localise } from './definitions'

/**
 * GLOBAL VARIABLES ============================================================
 * =============================================================================
 */

export * from './_envs'
export * from './configs'
export * from './defaults'
export * from './definitions'
export * from './files'
export * from './routes'
export * from './urls'
export * from './validations'

/* Platform Prefixes */
export const SERVER = 'SERVER'

localise(definitions)
