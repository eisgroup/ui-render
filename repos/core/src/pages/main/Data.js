import React, { Component } from 'react'
import { type } from 'ui-react-pack'
import { Active } from 'ui-utils-pack'
import UIRenderWithUISetup from './rules'

/**
 * Component to hold independent UI Render Instance Data
 *
 * @interface:
 *  a. The entire component is a separate instance of UI render
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
    // Identifier for this type of data.
    // Data of the same `kind` are grouped into array as list, and used for complex validation (together as group).
    kind: type.Id.isRequired,
    // The UI Render Instance containing this Data component
    instance: type.Object.isRequired,
    // The Index of this Data component in the array of rendered data for removing itself
    index: type.NumberOrString,
    // Data.json to use
    data: type.Any,
    // Meta.json to use
    meta: type.Object,
    // Data.json to initialize with
    initialValues: type.Any,
    // Whether the `name` attribute should use data relative to root UI Render instance, defaults to this instance.
    rootData: type.Boolean,

    relativePath: type.String,
    relativeIndex: type.Number,
  }

  static defaultProps = {
    data: {},
    meta: {},
  }

  render () {
    const {kind, instance, index, data, meta, initialValues = data, className, style, embedded, useForm} = this.props
    // Use Active.UIRender to avoid circular import
    const UIRender = Active.UIRender

    // For 'TableCells' add additional params to generate unique IDs
    if (meta.view === 'TableCells' || meta.view === 'Data') {
      meta.relativePath = this.props.relativePath;
      meta.relativeIndex = this.props.relativeIndex;
    }

    if (useForm) {
      return <UIRenderWithUISetup
        data={data}
        meta={meta}
        initialValues={initialValues}
        form={{kind}}
        parent={instance}
        index={index}
        embedded={embedded}
        {...{className, style}}
      />
    }

    return <UIRender
      data={data}
      meta={meta}
      initialValues={initialValues}
      form={{kind}}
      parent={instance}
      index={index}
      embedded={embedded}
      {...{className, style}}
    />
  }
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
