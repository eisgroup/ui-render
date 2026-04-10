import React, { PureComponent } from 'react'
import Button from 'ui-react-pack/Button'
import Input from 'ui-react-pack/Input'
import InputDate from 'ui-react-pack/InputDate'
import Table from 'ui-react-pack/Table'
import { Active } from 'ui-utils-pack'
import { email, isRequired, maxLength, password, url } from 'ui-react-pack/inputs/validationRules'
import { integer } from 'ui-react-pack/inputs/normalizers'
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

// Same string keys as FIELD.VALIDATE / metaToProps `validate` (see ui-modules-pack/form/constants.js)
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

/**
 * Table "add row" draft: values live only in React state until the user commits (Add).
 * No react-final-form Field registration — avoids leaking draft into parent `values`.
 */
export default class LocalDraftTableRow extends PureComponent {
  static defaultProps = {
    translate: Active.translate
  }

  state = {
    draft: {},
    fieldErrors: {}
  }

  handleChange = (name, def) => (e) => {
    const v = e && e.target ? e.target.value : e
    this.setState((s) => ({
      draft: { ...s.draft, [name]: v },
      fieldErrors: { ...s.fieldErrors, [name]: undefined }
    }))
  }

  handleAdd = () => {
    const { meta, kind, parentInstance, translate } = this.props
    const inputs = collectInputs(meta.items)
    const { draft, fieldErrors: prevErr } = this.state
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
      this.setState({ fieldErrors })
      return
    }

    pushDataKindRow({
      parentUIRender: parentInstance,
      meta,
      kind,
      rowObject: row,
      fallbackDataKindPath: ''
    })
    this.setState({ draft: {}, fieldErrors: {} })
  }

  renderInputCell = (def, i) => {
    const { translate } = this.props
    const name = def.name
    const { draft, fieldErrors } = this.state
    const value = draft[name]
    const error = fieldErrors[name]
    const { className, type, format: _f, validate: _v, ...rest } = def
    const common = {
      ...rest,
      name,
      value: value === undefined || value === null ? '' : value,
      onChange: this.handleChange(name, def),
      error,
      translate,
      className
    }
    return (
      <Table.Cell key={name || i} verticalAlign="top" className={def.classNameCellWrap}>
        {type === 'date'
          ? <InputDate {...common} />
          : <Input {...common} type={type || 'text'} />}
      </Table.Cell>
    )
  }

  renderBranch = (item, i) => {
    if (item.view === 'Input' && item.name) {
      return this.renderInputCell(item, i)
    }
    if (item.view === 'VerticalLayout' || item.view === 'Col3') {
      return (item.items || []).flatMap((sub, j) => this.renderBranch(sub, `${i}-${j}`))
    }
    if (item.view === 'Button') {
      const oc = item.onClick
      const isAdd = oc && (oc === 'addData' || oc.name === 'addData')
      if (!isAdd) return null
      const { onClick: _oc, children, ...btnRest } = item
      return (
        <Table.Cell key={`btn-${i}`} verticalAlign="top">
          <Button {...btnRest} type="button" onClick={this.handleAdd} translate={this.props.translate}>
            {children}
          </Button>
        </Table.Cell>
      )
    }
    return null
  }

  render () {
    const { meta } = this.props
    if (!meta || !meta.items) return null
    const cells = meta.items.flatMap((item, i) => {
      const node = this.renderBranch(item, i)
      if (node == null) return []
      return Array.isArray(node) ? node : [node]
    })
    return <>{cells}</>
  }
}
