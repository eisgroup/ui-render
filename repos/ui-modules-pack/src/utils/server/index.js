import { get } from 'ui-utils-pack'

/**
 * HELPER FUNCTIONS ============================================================
 * yarn add dotenv chalk
 * =============================================================================
 */

export * from './config'
export function getIpFromRequest (req) {
  return get(req, 'headers["x-forwarded-for"]') || get(req, 'connection.remoteAddress')
}
