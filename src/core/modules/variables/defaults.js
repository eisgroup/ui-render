import { __PROD__, Active, ONE_HOUR, ONE_MONTH, ONE_WEEK } from 'ui-utils-pack'
import { THEME } from './configs'
import { CURRENCY } from './definitions'

/**
 * PROJECT DEFAULTS ============================================================
 * =============================================================================
 */

export const DEFAULT = {
  LANGUAGE: Active.LANG._,
  CURRENCY: CURRENCY.USD._,
  LOGIN_DURATION: __PROD__ ? ONE_MONTH : ONE_WEEK, // match `TOKEN_LIFESPAN_JWT`
  GRADIENT_HUE_COUNT: 3,
  PAY_INTERVAL: ONE_HOUR,
  QUERY_LIMIT: 1000, // generic limit
  QUERY_ID_LIMIT: 10000, // about 2.9 KB for 100 ObjectIds, allowing 33k IDs per 1 MB
  THEME: THEME.LIGHT,
}
