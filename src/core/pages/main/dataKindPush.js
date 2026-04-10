import { get } from 'ui-utils-pack'
import { cloneDeep, set } from 'ui-utils-pack/object'

/**
 * From {@link registeredFieldValues} (nested tree), take the object for one FieldArray row.
 * addData previously pushed the whole tree so new rows looked empty (cells read `row.periodName`).
 * @param {*} registeredValues
 * @param {string} [relativePath] - table FieldArray path (same as Input prefix), e.g. `dataKind.experiencePeriods`
 * @param {number} rowIndex - target row index (draft row uses `array.length` as next slot)
 * @returns {*} row object or `registeredValues` if nothing to extract
 */
export function rowObjectForDataKindAppend (registeredValues, relativePath, rowIndex) {
    if (registeredValues == null || relativePath == null || relativePath === '') {
        return registeredValues
    }
    if (rowIndex == null || Number.isNaN(Number(rowIndex))) {
        return registeredValues
    }
    const extracted = get(registeredValues, `${relativePath}[${rowIndex}]`)
    if (extracted != null && typeof extracted === 'object' && !Array.isArray(extracted)) {
        return extracted
    }
    return registeredValues
}

/**
 * Whether a table row object should be kept: not all-null / not only `{}`.
 * Final-form often leaves `{ periodName: undefined, ... }`; DevTools shows that as `{}`.
 */
export function dataKindRowHasContent (row) {
    if (row == null) return false
    if (typeof row !== 'object') return true
    if (Array.isArray(row)) return row.length > 0
    for (const key of Object.keys(row)) {
        const v = row[key]
        if (v == null || v === '') continue
        if (typeof v === 'number') {
            if (!Number.isNaN(v)) return true
            continue
        }
        if (typeof v === 'boolean') return true
        if (typeof v === 'string') return true
        if (Array.isArray(v) && v.length > 0) return true
        if (typeof v === 'object' && dataKindRowHasContent(v)) return true
    }
    return false
}

/**
 * Same rules as {@link FIELD.VALIDATION} {@code notWithinRange} for one row, when the row is only in
 * local draft (not yet in the form array). Used by {@link LocalDraftTableRow} on Add.
 * @param {Object} draft - parsed field values for the new row
 * @param {Array<Object>} peerRows - existing rows from {@code parent.getDataKind(kind)} (draft not included)
 * @param {string} startKey
 * @param {string} endKey
 * @returns {Object|null} map of field name → error message, or null if valid
 */
export function validateNotWithinRangeDraftRow (draft, peerRows, startKey, endKey) {
    const _a = draft[startKey]
    const _b = draft[endKey]
    const err = {}
    if (_a !== undefined && _b !== undefined && _a !== '' && _b !== '') {
        if (_a === _b) {
            err[startKey] = 'Start date and end date cannot be the same'
            err[endKey] = 'Start date and end date cannot be the same'
            return err
        }
        if (String(_a) > String(_b)) {
            err[startKey] = 'Start date cannot be more than end date'
            err[endKey] = 'End date cannot be less than start date'
            return err
        }
    }
    if (!_a || !_b) return null

    const ranges = (peerRows || [])
        .filter((r) => r != null && typeof r === 'object')
        .map((r) => [r[startKey], r[endKey]])
        .filter(([a, b]) => a != null && b != null && a !== '' && b !== '')

    for (const [a, b] of ranges) {
        // Inclusive interval overlap on YYYY-MM-DD strings
        if (!(String(b) < String(_a) || String(_b) < String(a))) {
            err[startKey] = 'Periods cannot overlap'
            err[endKey] = 'Periods cannot overlap'
            return err
        }
    }
    return null
}

/**
 * Remove `null`, holes, empty `{}`, and rows whose only values are null/undefined from each array under `values.dataKind`.
 * After FieldArray `remove`, unmounting row fields can leave a ghost row in form values.
 * @param {*} values - full form values (e.g. root data object)
 * @returns {*} deep clone with compacted `dataKind.*` arrays
 */
export function compactDataKindArrays (values) {
    if (values == null || typeof values !== 'object') {
        return values
    }
    const out = cloneDeep(values)
    const dk = out.dataKind
    if (dk == null || typeof dk !== 'object') {
        return out
    }
    for (const key of Object.keys(dk)) {
        const arr = dk[key]
        if (!Array.isArray(arr)) continue
        dk[key] = arr.filter(dataKindRowHasContent)
    }
    return out
}

/**
 * Base object path for the row object that owns a `dataKind` map, from a form's
 * `meta.relativePath` which ends with `.dataKind.{kind}`.
 * Uses the last occurrence so paths with multiple `.dataKind.*` segments (nested tables) resolve correctly.
 * @param {string} [relativePath]
 * @param {string} kind - Data `kind` / key under `dataKind`
 * @returns {string} dot-path prefix, or '' when the block is the root `data` object's `dataKind`
 */
export function getDataKindPathFromRelative (relativePath, kind) {
    if (!relativePath || kind == null || kind === '') {
        return ''
    }
    const suffix = `.dataKind.${kind}`
    const i = relativePath.lastIndexOf(suffix)
    if (i === -1) {
        return ''
    }
    return relativePath.slice(0, i)
}

/**
 * Append one plain row object via the parent final-form array mutator, then sync `instance.state.data.json`
 * from form values (same pattern as REMOVE_DATA). Do not also splice `data.json` manually — when that array
 * shares a reference with `form.values`, manual spread + `mutators.push` can duplicate the new row.
 */
export function pushDataKindRow ({ parentUIRender, meta, kind, rowObject, fallbackDataKindPath = '' }) {
    const rel = meta && meta.relativePath
    const basePath = (rel != null && rel !== '')
        ? getDataKindPathFromRelative(rel, kind)
        : (fallbackDataKindPath || '')
    const dataKindPath = basePath ? `${basePath}.dataKind` : 'dataKind'
    const arrayPath = `${dataKindPath}.${kind}`
    const parentForm = parentUIRender.props.instance.form
    if (!parentForm || !parentForm.mutators || typeof parentForm.mutators.push !== 'function') {
        console.warn('pushDataKindRow: parent form or mutators.push is not available')
        return false
    }
    // Ensure the FieldArray path exists: lodash set creates intermediate objects (e.g. row.dataKind when
    // the parent row only had title/budget). No need to predeclare empty `lineItems` in JSON or add `dataKind: {}` on push.
    if (get(parentForm.getState().values, arrayPath) === undefined) {
        const values = cloneDeep(parentForm.getState().values)
        set(values, arrayPath, [])
        parentForm.reset(values)
        parentUIRender.setState((prev) => ({
            data: {
                ...prev.data,
                json: cloneDeep(values),
            },
        }))
    }
    const dataKind = get(parentForm.getState().values, dataKindPath)
    if (!dataKind || typeof dataKind !== 'object' || Array.isArray(dataKind)) {
        console.warn(`ADD_DATA: dataKind not found at "${dataKindPath}" (kind="${kind}", relativePath="${rel}")`)
        return false
    }
    parentForm.mutators.push(arrayPath, rowObject)
    const nextJson = cloneDeep(parentForm.getState().values)
    parentUIRender.setState(
        (prev) => ({
            data: {
                ...prev.data,
                json: nextJson,
            },
        }),
        () => {
            parentForm.reset(nextJson)
        }
    )
    return true
}
