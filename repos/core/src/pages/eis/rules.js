import { isCollection, isObject, isString, sanitizeGqlResponse } from '../../common/utils'
import { FIELD } from '../../common/variables'

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
      // Apply default Dropdown config if onChange is not defined
      if (val.view === FIELD.TYPE.DROPDOWN && val.name != null && val.onChange == null) {
        meta[key].onChange = FIELD.ACTION.SET_STATE + ',' + val.name
        if (val.value == null) meta[key].value = {name: `{state.${val.name},0}`}
        if (val.options != null) {
          if (isString(val.options)) meta[key].options = {name: val.options}
          if (isObject(val.mapOptions)) {
            if (val.mapOptions.value == null) meta[key].mapOptions.value = '{index}'
          } else {
            meta[key].mapOptions = {
              text: val.mapOptions, // if not defined, will default to given option value
              value: '{index}', // always enforce using index
            }
          }
        }
      }
    }
    // Convert `format` attribute to `normalize`
    else if (key === 'format') {
      meta.normalize = val
      delete meta[key]
    }
    // Convert `styles` attribute to `className`
    else if (key === 'styles') {
      meta.className = val
      delete meta[key]
    }
  }
  return meta
}

export function transformConfig (meta) {
  return toOpenLConfig(sanitizeGqlResponse(meta, {tags: []}))
}
