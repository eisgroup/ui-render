import React, { memo, useState } from 'react'
import Button from '../../components/Button'
import Input from '../../components/Input'
import InputDate from '../../components/InputDate'
import Table from '../../components/Table'
import { Active } from '../../utils'
import { email, isRequired, maxLength, password, url } from '../../components/inputs/validationRules'
import { integer } from '../../components/inputs/normalizers'
import { pushDataKindRow, validateNotWithinRangeDraftRow } from '../dataKindPush'

/**
 * Collect Input definitions from TableCells meta (including nested VerticalLayout).
 */
function collectInputs (items, out = []) {
  if (!items) return out
  for (const item of items) {
    if (item.view === 'Input' && item.name) out.push(item)
    if ((item.view === 'VerticalLayout' || item.view === 'Col3') && item.items) {
      collectInputs(item.items, out)
    }
  }
  return out
}

// Same string keys as FIELD.VALIDATE / metaToProps `validate` (see src/core/modules/form/constants.js)
const VALIDATION_BY_NAME = {
  email,
  required: isRequired,
  maxLength,
  password,
  url
}

function resolveValidator (validate) {
  if (validate == null) return null
  if (typeof validate === 'function') return validate
  if (typeof validate === 'string') {
    return VALIDATION_BY_NAME[validate] || VALIDATION_BY_NAME[validate.toLowerCase()]
  }
  return null
}

function parseRowValue (def, raw) {
  const { type, format } = def
  if (raw === '' || raw == null) return type === 'number' ? undefined : raw
  if (type === 'number') {
    if (format === 'integer') return integer(raw)
    const n = parseFloat(raw)
    return Number.isNaN(n) ? raw : n
  }
  return raw
}

// Read once, when this module loads, as the class's `defaultProps` were. `Active.translate` is reassigned by
// every document the engine constructs (rules.js), so reading it at render would hand a draft row whichever
// document was built last.
const DEFAULT_TRANSLATE = Active.translate

const EMPTY_DRAFT = { draft: {}, fieldErrors: {} }

/**
 * Table "add row" draft: values live only in React state until the user commits (Add).
 * No react-final-form Field registration — avoids leaking draft into parent `values`.
 */
function LocalDraftTableRow ({ meta, kind, parentInstance, translate = DEFAULT_TRANSLATE }) {
  const [state, setState] = useState(EMPTY_DRAFT)
  // `this.setState` merged into the state it was given; this keeps that shape, and the updater form.
  const update = (partial) => setState((s) => ({ ...s, ...(typeof partial === 'function' ? partial(s) : partial) }))

  const handleChange = (name) => (e) => {
    const v = e && e.target ? e.target.value : e
    update((s) => ({
      draft: { ...s.draft, [name]: v },
      fieldErrors: { ...s.fieldErrors, [name]: undefined }
    }))
  }

  const handleAdd = () => {
    const inputs = collectInputs(meta.items)
    const { draft, fieldErrors: prevErr } = state
    const fieldErrors = { ...prevErr }
    let hasErr = false

    const row = {}
    for (const def of inputs) {
      const name = def.name
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
  const renderInputCell = (def, i) => {
    const name = def.name
    const { draft, fieldErrors } = state
    const value = draft[name]
    const error = fieldErrors[name]
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

  const renderBranch = (item, i) => {
    if (item.view === 'Input' && item.name) {
      return renderInputCell(item, i)
    }
    if (item.view === 'VerticalLayout' || item.view === 'Col3') {
      return (item.items || []).flatMap((sub, j) => renderBranch(sub, `${i}-${j}`))
    }
    if (item.view === 'Button') {
      const oc = item.onClick
      const isAdd = oc && (oc === 'addData' || oc.name === 'addData')
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
