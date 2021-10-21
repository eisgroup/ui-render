import React, { Component } from 'react'
import { type } from 'react-ui-pack'
import { Active, cloneDeep, isCollection, isInList } from 'utils-pack'

/**
 * Component to hold independent UI Render Instance Data
 *
 * @interface:
 *  a. The entire component is like a separate instance of UI render
 *  b. Data component can be created via meta.json config, or by uploading a meta.json file.
 *    {
 *      view: 'Data',
 *      kind: 'Id',
 *      data: {
 *        // can be loaded from existing UI
 *        name: 'path.to.data.to.use.as.json'
 *      },
 *      meta: {
 *        view:
 *      }
 *    }
 *
 */
export default class Data extends Component {
  static propTypes = {
    // Data.json to use
    data: type.Any,
    // Meta.json to use
    meta: type.Object,
    // Data.json to initialize with
    initialValues: type.Object,
    // Identifier for this type of data.
    // Data of the same `kind` are grouped into array as list, and used for complex validation (together as group).
    kind: type.Id,
    // Whether the `name` attribute should use data relative to root UI Render instance, defaults to this instance.
    rootData: type.Boolean,
  }

  static defaultProps = {
    data: {},
    meta: {},
  }

  // not needed for now because `meta` config does not get parsed
  // stateFromMeta = (meta) => {
  //   const {rootData} = this.props
  //   if (!rootData) removeKeys(meta, ['relativePath'], {recursive: true})
  //   return meta
  // }

  state = {
    data: this.props.data,
    meta: this.props.meta,
    initialValues: this.props.initialValues || this.props.data,
  }

  render () {
    const {kind} = this.props
    const {data, meta, initialValues} = this.state
    console.warn('data.props', this.props)
    // Use Active.UIRender to avoid circular import
    const UIRender = Active.UIRender
    return <UIRender data={data} meta={meta} initialValues={initialValues} form={{kind}}/>
  }
}

/**
 * Recursively remove given list of keys from object or collection
 * @param {Object|Array} obj - or collection to remove keys from
 * @param {String[]} keys - list of keys to remove
 * @param {Boolean} [clone] - whether to return new object, defaults to mutating existing
 * @param {Boolean} [recursive] - whether to parse given obj recursively
 */
function removeKeys (obj, keys, {clone = false, recursive = false} = {}) {
  const data = clone ? cloneDeep(obj) : obj
  for (const key in data) {
    if (isInList(keys, key)) {
      delete data[key]
    } else if (recursive && isCollection(data[key])) {
      data[key] = removeKeys(data[key], keys, {recursive})
    }
  }
  return data
}

// =============================================================================
// NOTES
/**
 * @strategies:
 *  1. Render all Input as is, with button (configured) duplicating all inputs into new form instance
 *  2. Render Input inside configured Data component as independent UI Render instance
 *     + validation is isolated from the rest of UI
 *     + submission of the entire UI does not submit temporary instance
 *     + easy to understand for end users
 *     + allows uploading file with errors as config, without breaking the rest of UI.
 *  => Choose the 2nd option, because it's architecturally correct.
 */
// =============================================================================
