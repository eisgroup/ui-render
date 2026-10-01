import React from 'react'
import { Active } from '../utils'
import DocumentWithOwnForm from './rules'
import LocalDraftTableRow from './components/LocalDraftTableRow'
import type { LocalDraftTableRowProps } from './components/LocalDraftTableRow'

/**
 * Both nested documents are re-typed as open prop bags where they are read, for reasons of their own,
 * not the migration's. `Active.UIRender`, the document that shares its parent's form, is a slot of the
 * runtime registry, which `utils` types `unknown` because it sits below the engine. `rules.tsx`'s default
 * export, the document with a form of its own, types `initialValues` as a record, and this component
 * hands it a row's data, which it types `unknown`.
 *
 * The casts happen AT RENDER, not in a module-level constant, and that is load-bearing. `rules.tsx` imports
 * `mapper.tsx`, which imports this file, which imports `rules.tsx` back: while this module is evaluated, that
 * default export is still undefined. A constant would keep the undefined for good (measured: every nested
 * form-backed document rendered nothing), where reading the import inside the render sees the live binding.
 */
type OpenComponent = React.ComponentType<Record<string, unknown>>

/** A meta node as `Data` reads it: only its `view`, and a nested `meta`, are looked at here. */
export type DataMeta = { view?: string, meta?: DataMeta, [key: string]: unknown }

export type DataProps = {
  /** Data of the same `kind` are grouped into an array, and validated together as a group. */
  kind: string
  /** The UI Render instance containing this Data component; a draft row reads its data kinds */
  instance: NonNullable<LocalDraftTableRowProps['parentInstance']>
  /** The index of this Data component in the array of rendered data, for removing itself */
  index?: number | string
  /** Data.json to use */
  data?: unknown
  /** Meta.json to use */
  meta?: DataMeta
  /** Data.json to initialize with, `data` by default */
  initialValues?: unknown
  /** Whether `name` should use data relative to the root UI Render instance, defaults to this instance */
  rootData?: boolean
  relativePath?: string
  relativeIndex?: number
  /** When true, a TableCells draft row keeps its values in local state until Add */
  localDraft?: boolean
  className?: string
  style?: React.CSSProperties
  embedded?: boolean
  useForm?: boolean
}

// The class's `defaultProps` were two shared objects, and their identity is part of what they meant: `data`
// reaches the nested document, which compares what it is given by reference. A default parameter would be a
// new object on every render.
const NO_DATA = {}
const NO_META: DataMeta = {}

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
export default function Data ({
  kind, instance, index, relativeIndex, relativePath, data = NO_DATA, meta: metaIn = NO_META, initialValues = data,
  className, style, embedded, useForm, localDraft,
}: DataProps) {
  // Use Active.UIRender to avoid circular import
  const UIRender = Active.UIRender as OpenComponent
  const UIRenderWithUISetup = DocumentWithOwnForm as OpenComponent

  // Never mutate shared meta from config: nested tables (e.g. one Data/TableCells per outer row) reuse the
  // same meta object reference — writing relativePath/relativeIndex on it would leave every row with the
  // last-rendered row's paths (mixed data, inputs not updating / wrong targets).
  const meta = (metaIn.view === 'TableCells' || metaIn.view === 'Data')
    ? {...metaIn, relativePath, relativeIndex}
    : metaIn

  // TableCells only, or Data wrapping TableCells (e.g. renderExtraItem). Draft values stay in React state
  // until Add — no final-form fields at dataKind.*[nextIndex], so an empty `{}` is not materialized for the draft row.
  if (localDraft) {
    const rel = { relativePath, relativeIndex }
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

  // Table row contexts set `relativeIndex` (field array index); `index` is often unset.
  // Prefer relativeIndex over index so row identity stays correct after FieldArray reindex (e.g. remove row).
  const rowIndex = relativeIndex != null ? relativeIndex : index

  if (useForm) {
    return <UIRenderWithUISetup
      data={data}
      meta={meta}
      initialValues={initialValues}
      form={{kind}}
      parent={instance}
      index={rowIndex}
      relativeIndex={relativeIndex}
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
    index={rowIndex}
    relativeIndex={relativeIndex}
    embedded={embedded}
    {...{className, style}}
  />
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
