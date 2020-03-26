import { isCollection, sanitizeGqlResponse } from '../../common/utils'

/**
 * BUSINESS RULES ==============================================================
 * UI Config transform logic specific to OpenL reports
 * =============================================================================
 */

export function toOpenLConfig (meta) {
  for (const key in meta) {
    const val = meta[key]
    if (isCollection(val)) {
      meta[key] = toOpenLConfig(val)
    }
    // Convert `format` attribute to `normalize`
    else if (key === 'format') {
      meta.normalize = val
      delete meta[key]
    }
  }
  return meta
}

export function transformConfig (meta) {
  return toOpenLConfig(sanitizeGqlResponse(meta, {tags: []}))
}
