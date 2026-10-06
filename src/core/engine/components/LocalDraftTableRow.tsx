import React, { memo, useState } from 'react'
import Button from '../../components/Button'
import Input from '../../components/Input'
import InputDate from '../../components/InputDate'
import Table from '../../components/Table'
import { Active } from '../../utils'
import { FIELD } from '../../modules/variables'
import type { Translate } from '../../utils/_envs'
import { email, isRequired, maxLength, password, url } from '../../components/inputs/validationRules'
import { integer } from '../../components/inputs/normalizers'
import { pushDataKindRow, validateNotWithinRangeDraftRow } from '../dataKindPush'
import type { DataKindParent } from '../dataKindPush'

type Validator = (value: unknown) => unknown

/** A meta node of the draft row, as this file reads it. */
export type DraftItem = {
  view?: string
  name?: string
  items?: DraftItem[]
  type?: string
  format?: string
  validate?: unknown
  verify?: { dataKind?: string, validate?: Array<{ name?: string, args?: string[] }> }
  className?: string
  classNameCellWrap?: string
  /** An action name, or the resolved action itself: a function whose `name` is the action's */
  onClick?: string | { name?: string } | ((...args: unknown[]) => unknown)
  children?: React.ReactNode
  [key: string]: unknown
}

export type LocalDraftTableRowProps = {
  /** The `Data` block's meta: its cells, and the path of the rows a draft is added to */
  meta?: { items?: DraftItem[], relativePath?: string | null, [key: string]: unknown }
  kind?: string
  parentInstance?: DataKindParent & { getDataKind?: (kind?: string) => object[], [key: string]: unknown }
  translate?: Translate
}

type DraftState = { draft: Record<string, unknown>, fieldErrors: Record<string, unknown> }
type ChangeEventLike = { target?: { value?: unknown } }

/**
 * Whether a view is a column layout a draft row descends into: `Col` and its aliases. It tested for
 * `'Col3'` until 2026-10-06, the constant's KEY rather than a view name, so `Col` and `Column` were
 * skipped. Read when called, not captured at load (CLAUDE.md, the import-cycle gotcha).
 */
const isColumn = (view: unknown) => view === FIELD.TYPE.COL || view === FIELD.TYPE.COL2 || view === FIELD.TYPE.COL3

/**
 * Collect Input definitions from TableCells meta (including nested column layouts).
 */
function collectInputs (items: DraftItem[] | undefined, out: DraftItem[] = []): DraftItem[] {
  if (!items) return out
  for (const item of items) {
    if (item.view === 'Input' && item.name) out.push(item)
    if (isColumn(item.view) && item.items) {
      collectInputs(item.items, out)
    }
  }
  return out
}

// Same string keys as FIELD.VALIDATE / metaToProps `validate` (see src/core/modules/form/constants.ts)
const VALIDATION_BY_NAME: Record<string, Validator | undefined> = {
  email,
  required: isRequired,
  // The validator at the factory's default of 100 characters, as `FIELD.VALIDATION` has it: `maxLength`
  // itself is the factory, and registered here it made every draft with `validate: 'maxLength'` fail.
  maxLength: maxLength(),
  password,
  url
}

function resolveValidator (validate: unknown): Validator | null | undefined {
  if (validate == null) return null
  if (typeof validate === 'function') return validate as Validator
  if (typeof validate === 'string') {
    return VALIDATION_BY_NAME[validate] || VALIDATION_BY_NAME[validate.toLowerCase()]
  }
  return null
}

function parseRowValue (def: DraftItem, raw: unknown) {
  const { type, format } = def
  if (raw === '' || raw == null) return type === 'number' ? undefined : raw
  if (type === 'number') {
    if (format === 'integer') return integer(raw)
    const n = parseFloat(raw as string)
    return Number.isNaN(n) ? raw : n
  }
  return raw
}

// Read once, when this module loads, as the class's `defaultProps` were. `Active.translate` is reassigned by
// every document the engine constructs (rules.tsx), so reading it at render would hand a draft row whichever
// document was built last.
const DEFAULT_TRANSLATE = Active.translate

const EMPTY_DRAFT: DraftState = { draft: {}, fieldErrors: {} }

/**
 * Table "add row" draft: values live only in React state until the user commits (Add).
 * No react-final-form Field registration — avoids leaking draft into parent `values`.
 */
function LocalDraftTableRow ({ meta, kind, parentInstance, translate: translateProp }: LocalDraftTableRowProps) {
  // The document's own translator, when it is not handed one. `Data` hands none, and the module default
  // is the translator from before any document set its own, so labels, placeholders, errors and the Add
  // button were never translated until 2026-10-06.
  const translate = translateProp || (parentInstance && parentInstance.translate as Translate | undefined) || DEFAULT_TRANSLATE
  const [state, setState] = useState<DraftState>(EMPTY_DRAFT)
  // `this.setState` merged into the state it was given; this keeps that shape, and the updater form.
  const update = (partial: Partial<DraftState> | ((s: DraftState) => Partial<DraftState>)) =>
    setState((s) => ({ ...s, ...(typeof partial === 'function' ? partial(s) : partial) }))

  const handleChange = (name: string) => (e: unknown) => {
    // The JavaScript expression as it was, cast rather than restructured: an event carries its value on
    // `target`, and a date input hands the value itself.
    const v = e && (e as ChangeEventLike).target ? (e as ChangeEventLike).target!.value : e
    update((s) => ({
      draft: { ...s.draft, [name]: v },
      fieldErrors: { ...s.fieldErrors, [name]: undefined }
    }))
  }

  const handleAdd = () => {
    const inputs = collectInputs(meta!.items)
    const { draft, fieldErrors: prevErr } = state
    const fieldErrors = { ...prevErr }
    let hasErr = false

    const row: Record<string, unknown> = {}
    for (const def of inputs) {
      const name = def.name as string
      const raw = draft[name]
      const validator = resolveValidator(def.validate)
      const parsed = parseRowValue(def, raw)
      if (validator) {
        const err = validator(parsed)
        if (err) {
          fieldErrors[name] = err
          hasErr = true
        }
      }
      row[name] = parsed
    }

    const verifyMeta = inputs.find((i) => i.verify)?.verify
    if (!hasErr && verifyMeta && parentInstance && typeof parentInstance.getDataKind === 'function') {
      const notWithin = verifyMeta.validate && verifyMeta.validate.find((v) => v.name === 'notWithinRange')
      if (notWithin && notWithin.args && notWithin.args.length >= 2) {
        const [startKey, endKey] = notWithin.args
        const peerRows = parentInstance.getDataKind(verifyMeta.dataKind)
        const crossErr = validateNotWithinRangeDraftRow(row, peerRows, startKey, endKey)
        if (crossErr) {
          Object.assign(fieldErrors, crossErr)
          hasErr = true
        }
      }
    }

    if (hasErr) {
      update({ fieldErrors })
      return
    }

    const appended = pushDataKindRow({
      parentUIRender: parentInstance,
      meta,
      kind,
      rowObject: row,
      fallbackDataKindPath: ''
    })
    if (appended !== false) update({ draft: {}, fieldErrors: {} })
  }

  /**
   * @Note: these two cells used to pass `verticalAlign="top"`. Semantic's `Table.Cell` turned that
   *  into the classes `top aligned`, and NO loaded CSS selects on `aligned` (0 occurrences in
   *  `static/all.css` and in `src/style`) — so the 15 cells that asked for it rendered at the
   *  `<td>` default anyway. The prop was dropped with the in-house `Table` (§9.7-F1 step 1) rather
   *  than reproduced as dead markup. If a draft row should really align to the top, say so with
   *  `style={{verticalAlign: 'top'}}`, which is what the metas that actually align already do —
   *  and expect a visual change, because that one works.
   */
  const renderInputCell = (def: DraftItem, i: number | string) => {
    const name = def.name as string
    const { draft, fieldErrors } = state
    const value = draft[name]
    // A cast: a validator returns its message, or `email`'s falsy value, and the state holds it untyped.
    const error = fieldErrors[name] as React.ReactNode
    const { className, type, format: _f, validate: _v, ...rest } = def
    const common = {
      ...rest,
      name,
      value: value === undefined || value === null ? '' : value,
      onChange: handleChange(name),
      error,
      translate,
      className
    }
    return (
      <Table.Cell key={name || i} className={def.classNameCellWrap}>
        {type === 'date'
          ? <InputDate {...common} />
          : <Input {...common} type={type || 'text'} />}
      </Table.Cell>
    )
  }

  const renderBranch = (item: DraftItem, i: number | string): React.ReactNode => {
    if (item.view === 'Input' && item.name) {
      return renderInputCell(item, i)
    }
    if (isColumn(item.view)) {
      return (item.items || []).flatMap((sub, j) => renderBranch(sub, `${i}-${j}`))
    }
    if (item.view === 'Button') {
      const oc = item.onClick
      // `.name` is read off whatever `onClick` is, a function included: the engine resolves the action
      // to a function named after it.
      const isAdd = oc && (oc === 'addData' || (oc as { name?: unknown }).name === 'addData')
      if (!isAdd) return null
      const { onClick: _oc, children, ...btnRest } = item
      return (
        <Table.Cell key={`btn-${i}`}>
          <Button {...btnRest} type="button" onClick={handleAdd} translate={translate}>
            {children}
          </Button>
        </Table.Cell>
      )
    }
    return null
  }

  if (!meta || !meta.items) return null
  const cells = meta.items.flatMap((item, i) => {
    const node = renderBranch(item, i)
    if (node == null) return []
    return Array.isArray(node) ? node : [node]
  })
  return <>{cells}</>
}

// `memo` skips a render with shallow-equal props, as `PureComponent` did.
export default memo(LocalDraftTableRow)
