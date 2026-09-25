import { get } from '../utils'
import { cloneDeep, set } from '../utils/object'

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

    const ranges = (Array.isArray(peerRows) ? peerRows : [])
        .filter((r) => r != null && typeof r === 'object')
        .map((r) => [r[startKey], r[endKey]])
        .filter(([a, b]) => a != null && b != null && a !== '' && b !== '')

    for (const [a, b] of ranges) {
        let peerStart = String(a)
        let peerEnd = String(b)
        if (peerStart > peerEnd) {
            [peerStart, peerEnd] = [peerEnd, peerStart]
        }
        // Inclusive interval overlap on YYYY-MM-DD strings
        if (!(peerEnd < String(_a) || String(_b) < peerStart)) {
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
 * Where one `Data` block's `dataKind` map lives in the parent form's values — `dataKind` at the
 * root, `orders.0.dataKind` inside a parent row; the rows are at `.{kind}` under it. Adding a row,
 * removing one and `pushDataKindRow` each spelled this out in full until §9.3 step 2 gave it one
 * home.
 *
 * `fallbackDataKindPath` is what `registerDataKind` recorded on the instance, and is read ONLY
 * when the block's current `relativePath` is empty. It is computed from that same `relativePath`,
 * so it can differ from `''` only if the path went from non-empty to empty without the instance
 * re-registering, which happens only on an `index` or `kind` change. No test and no example in the
 * corpus does that; the fallback is kept because the three copies all had it.
 *
 * @param {Object} [meta] - the `Data` block's meta, read for `relativePath`
 * @param {string} kind - Data `kind` / key under `dataKind`
 * @param {string} [fallbackDataKindPath] - the instance's registered `dataKindPath`
 * @returns {string} dot-path of the `dataKind` map in the parent form's values
 */
export function dataKindPathFor (meta, kind, fallbackDataKindPath = '') {
    const rel = meta && meta.relativePath
    const basePath = (rel != null && rel !== '')
        ? getDataKindPathFromRelative(rel, kind)
        : (fallbackDataKindPath || '')
    return basePath ? `${basePath}.dataKind` : 'dataKind'
}

/**
 * Append one plain row object via the parent final-form array mutator, then sync `instance.state.data.json`
 * from form values (same pattern as REMOVE_DATA). Do not also splice `data.json` manually — when that array
 * shares a reference with `form.values`, manual spread + `mutators.push` can duplicate the new row.
 */
export function pushDataKindRow ({ parentUIRender, meta, kind, rowObject, fallbackDataKindPath = '' }) {
    const rel = meta && meta.relativePath
    const dataKindPath = dataKindPathFor(meta, kind, fallbackDataKindPath)
    const arrayPath = `${dataKindPath}.${kind}`
    const parentForm = parentUIRender && parentUIRender.props && parentUIRender.props.instance && parentUIRender.props.instance.form
    if (
        !parentUIRender || typeof parentUIRender.setState !== 'function' ||
        !parentForm || typeof parentForm.getState !== 'function' || typeof parentForm.reset !== 'function' ||
        !parentForm.mutators || typeof parentForm.mutators.push !== 'function'
    ) {
        console.warn('pushDataKindRow: parent UI/form API or mutators.push is not available')
        return false
    }
    const initialFormState = parentForm.getState()
    const initialFormValues = initialFormState && initialFormState.values
    if (initialFormValues == null || typeof initialFormValues !== 'object' || Array.isArray(initialFormValues)) {
        console.warn('pushDataKindRow: form state values are not an object')
        return false
    }
    // Ensure the FieldArray path exists: lodash set creates intermediate objects (e.g. row.dataKind when
    // the parent row only had title/budget). No need to predeclare empty `lineItems` in JSON or add `dataKind: {}` on push.
    if (get(initialFormValues, arrayPath) === undefined) {
        const values = cloneDeep(initialFormValues)
        set(values, arrayPath, [])
        parentForm.reset(cloneDeep(values))
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
            // Keep the form snapshot isolated from component state: final-form implementations may retain
            // the object passed to reset and later mutate its nested values.
            parentForm.reset(cloneDeep(nextJson))
        }
    )
    return true
}

/**
 * Remove one row via the parent final-form array mutator, then sync `instance.state.data.json` from
 * the form values — the counterpart of `pushDataKindRow`, lifted out of the `removeData` action at
 * §9.3 step 2. Only final-form-arrays `remove` touches the rows: when `state.data.json` and the form
 * values share references, a manual splice as well would delete two rows or leave `{}`.
 *
 * The parent INSTANCE and the parent FORM arrive separately because the action reads them at
 * different times, and that is kept: the form, the meta and the index are read at click time, while
 * the instance whose state is set is the one captured when `config` was first read. The action's
 * comment said an index captured then would remove the wrong slot once siblings re-index; that was
 * NOT reproducible while extracting this — rows are keyed by position, so a captured index stays
 * right — and reading it at click time is kept because it is right either way.
 *
 * Unlike `pushDataKindRow`, the object handed to `reset` is the same one put into state. Measured
 * with the real final-form while extracting this: the two share a reference after a removal, and a
 * later edit does NOT write through it — final-form updates immutably — so the shared reference has
 * no observable effect, and the clone `pushDataKindRow` makes defensively was not added here.
 *
 * @param {Object} options
 * @param {Object} options.parentUIRender - the parent engine instance whose state is synced
 * @param {Object} options.parentForm - the parent's final-form instance
 * @param {Object} [options.meta] - the `Data` block's meta, read for `relativePath`
 * @param {string} options.kind - Data `kind` / key under `dataKind`
 * @param {number|string} options.index - the row to remove
 * @param {string} [options.fallbackDataKindPath] - the instance's registered `dataKindPath`
 * @returns {boolean} false when the parent form cannot remove rows
 */
export function removeDataKindRow ({ parentUIRender, parentForm, meta, kind, index, fallbackDataKindPath = '' }) {
    const arrayPath = `${dataKindPathFor(meta, kind, fallbackDataKindPath)}.${kind}`
    if (!parentForm || !parentForm.mutators || typeof parentForm.mutators.remove !== 'function') {
        console.warn('REMOVE_DATA: parent form or mutators.remove is not available')
        return false
    }
    parentForm.mutators.remove(arrayPath, Number(index))
    const nextJson = compactDataKindArrays(cloneDeep(parentForm.getState().values))
    parentUIRender.setState((prev) => ({
        data: {
            ...prev.data,
            json: nextJson,
        },
    }), () => {
        parentForm.reset(nextJson)
    })
    return true
}
