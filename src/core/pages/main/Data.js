import React, { Component } from 'react'
import { type } from 'ui-react-pack'
import { Active } from 'ui-utils-pack'
import UIRenderWithUISetup from './rules'
import LocalDraftTableRow from './components/LocalDraftTableRow'

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
    /** When true, TableCells draft row uses local state only until Add (no nested form / no parent values leakage). */
    localDraft: type.Boolean,
  }

  static defaultProps = {
    data: {},
    meta: {},
  }

  render () {
    const {kind, instance, index, data, meta: metaIn, initialValues = data, className, style, embedded, useForm, localDraft} = this.props
    // Use Active.UIRender to avoid circular import
    const UIRender = Active.UIRender

    // Never mutate shared meta from config: nested tables (e.g. one Data/TableCells per outer row) reuse the
    // same meta object reference — writing relativePath/relativeIndex on it would leave every row with the
    // last-rendered row's paths (mixed data, inputs not updating / wrong targets).
    const meta = (metaIn.view === 'TableCells' || metaIn.view === 'Data')
      ? {...metaIn, relativePath: this.props.relativePath, relativeIndex: this.props.relativeIndex}
      : metaIn

    // TableCells only, or Data wrapping TableCells (e.g. renderExtraItem). Draft values stay in React state
    // until Add — no final-form fields at dataKind.*[nextIndex], so an empty `{}` is not materialized for the draft row.
    if (localDraft) {
      const rel = { relativePath: this.props.relativePath, relativeIndex: this.props.relativeIndex }
      const draftMeta = metaIn.view === 'TableCells'
        ? meta
        : (metaIn.meta && metaIn.meta.view === 'TableCells' ? { ...metaIn.meta, ...rel } : null)
      if (draftMeta) {
        return (
          <LocalDraftTableRow
            meta={draftMeta}
            kind={kind}
            parentInstance={instance}
          />
        )
      }
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
