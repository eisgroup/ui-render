import { get } from 'utils-pack'

/**
 * HELPER FUNCTIONS ============================================================
 * =============================================================================
 */

export function getIpFromRequest (req) {
  return get(req, 'headers["x-forwarded-for"]') || get(req, 'connection.remoteAddress')
}
