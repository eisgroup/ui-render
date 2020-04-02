import { get, isCollection, isObject, isString, sanitizeGqlResponse } from '../../common/utils'
import { FIELD } from '../../common/variables'

/**
 * BUSINESS RULES ==============================================================
 * UI Config transform logic specific to OpenL reports
 * =============================================================================
 */

export function toOpenLConfig (meta) {
  if (isObject(meta)) {

    // Apply default Dropdown config if onChange is not defined
    if (meta.view === FIELD.TYPE.DROPDOWN && meta.name != null && meta.onChange == null) {
      meta.onChange = FIELD.ACTION.SET_STATE + ',' + meta.name
      if (meta.value == null) meta.value = {name: `{state.${meta.name},0}`}
      if (meta.options != null) {
        if (isString(meta.options)) meta.options = {name: meta.options}
        if (isObject(meta.mapOptions)) {
          if (meta.mapOptions.value == null) meta.mapOptions.value = '{index}'
        } else {
          meta.mapOptions = {
            text: meta.mapOptions, // if not defined, will default to given option value
            value: '{index}', // always enforce using index
          }
        }
      }
    }

    // Add Table Expand to first column if `renderItem` defined, but `renderCell` is undefined
    else if (meta.view === FIELD.TYPE.TABLE && meta.renderItem != null) {
      const firstHeader = get(meta.headers, '[0]')
      if (isObject(firstHeader) && firstHeader.renderCell == null) {
        firstHeader.renderCell = {
          view: FIELD.TYPE.EXPAND,
          name: '{value}',
          id: firstHeader.id,
          onClick: 'handleItemExpand',
        }
      }
    }
  }

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
