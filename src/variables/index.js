import { localise } from 'utils-pack'
import * as definitions from './definitions'

/**
 * GLOBAL VARIABLES ============================================================
 * =============================================================================
 */

export * from './_envs'
export * from './configs'
export * from './defaults'
export * from './definitions'
export * from './fields'
export * from './files'
export * from './routes'
export * from './urls'
export * from './validations'

/* Platform Prefixes */
export const CLIENT = 'CLIENT'
export const SERVICE = {
  BOT: 'BOT',
  CLIENT: 'CLIENT',
  MOBILE: 'MOBILE',
  SERVER: 'SERVER',
  WEB: 'WEB',
}

localise(definitions)
