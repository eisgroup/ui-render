import { get } from '../utils'

/** What a popup's scope resolves to: the row index, the row's data, and the array path of its fields. */
export type PopupScope = { relativeIndex: number | null, relativeData: unknown, relativePath: string | null | undefined }

/** The UIRender instance's props, as far as a popup's scope reads them. */
export type ScopeProps = {
    relativeIndex?: number | null
    relativePath?: string | null
    index?: number | null
    _data?: unknown
    [key: string]: unknown
}

/** A form, as far as its values are read. */
type ValuesSource = { getState?: () => { values?: unknown } }

/**
 * WHICH ROW A POPUP BELONGS TO — the scope a `popupOpen` action resolves before it interpolates.
 * =============================================================================================
 *
 * Lifted out of the `POPUP_OPEN` handler at §9.3 step 2. That handler is three hundred lines, the
 * largest single thing in `rules.js`, and this was sixty of them: a four-source chain deciding the
 * row index, the row data and the array path a popup's fields should be named against.
 *
 * A function of its arguments. The instance reaches it as `props` and `form` rather than `this`,
 * because everything it reads is a value.
 *
 * THERE WERE FOUR SOURCES; ONE IS GONE. A source keyed on `props.relativePath` sat between 2 and 3
 * below, and nothing ever set that prop on an engine instance — `Data.tsx` passes `index` and
 * `relativeIndex` to a nested UIRender but puts the path in `meta`, and the only other
 * `relativePath=` in the engine goes to a `Render`, not to a UIRender. Its condition could not be
 * true, so cases fell past it to the last source, and removing it changes nothing.
 *
 * The other three were measured over the whole suite and NOT removed, which is the opposite of
 * what §9.3 predicted: sources 1 and 2 never fire in any test, but `Data.tsx` does set the props
 * they read, so they are reachable in a nested document and merely uncovered. Deleting them on the
 * strength of "no test hits this" would have been a live behaviour change. Source 4 keeps its live
 * half, the form's values; its search for a row in their keys could never succeed and is gone.
 *
 * @param {String} id - the popup id, possibly already interpolated (`edit.1`)
 * @param {Object} [form] - the form whose state the later sources read
 * @param {Object} [props] - the UIRender instance's props
 * @returns {{relativeIndex: ?Number, relativeData: *, relativePath: ?String}} the resolved scope
 */
export function resolvePopupScope ({ id, form, props = {} }: { id: string, form?: ValuesSource | null, props?: ScopeProps }): PopupScope {
    // Try to get index and path from multiple sources
    let relativeIndex: number | null = null
    let relativeData: unknown = null
    let relativePath: string | null | undefined = null

    // First, try to extract index from already interpolated ID (e.g., "SomeReason.0" -> 0)
    if (/\.\d+$/.test(id)) {
        const idMatch = id.match(/\.(\d+)$/)
        if (idMatch) {
            relativeIndex = parseInt(idMatch[1], 10)
        }
    }

    const hasFormState = form && typeof form.getState === 'function'

    // 1. Try from props (only if not already set from the id)
    if (relativeIndex == null && props.relativeIndex != null) {
        relativeIndex = props.relativeIndex
        relativeData = props._data
        if (relativePath == null) {
            relativePath = props.relativePath
        }
    }
    // 2. Try from form context (only if relativeIndex not already set)
    // Not undefined below: `hasFormState` has checked both the form and its `getState`.
    else if (relativeIndex == null && hasFormState && props.index != null) {
        relativeIndex = props.index
        relativeData = form!.getState!().values
        relativePath = props.relativePath
    }
    // 4. The form's values, which the id interpolation reads. This source also looked for a row in
    // the keys of those values, `name[index]`, and could not find one: final-form nests a bracketed
    // name into a real array, so a top-level key never contains `[`. Reading the registered fields
    // instead, as was meant, would be the very guess `resolvePopupRowContext` refuses below — a row
    // inferred from field names binds the popup to whichever table comes first — so it is gone.
    else if (relativeIndex == null && hasFormState) {
        relativeData = form!.getState!().values
    }

    return { relativeIndex, relativeData, relativePath }
}

/**
 * WHAT A POPUP OPENED FROM A TEMPLATE IS BOUND TO — the row index, the array path its fields are
 * named against, the row data they show, and the document that row lives in.
 * =============================================================================================
 *
 * The second half of the scope, lifted out of `POPUP_OPEN` at §9.3 step 2 after `resolvePopupScope`
 * above. Each value has a precedence, highest first:
 *
 *   index — the caller's `options.relativeIndex`, the resolved scope's, the template's own
 *   path  — the caller's `options.relativePath`, the resolved scope's, the INSTANCE's
 *           `props.relativePath`, the template's own. Nothing in the engine sets that prop: `Data.tsx`
 *           gives a nested instance `index` and `relativeIndex` only. It is reachable through the
 *           host's props, which `library/main.tsx` spreads onto the top-level instance, though the
 *           public types do not declare it; kept for that reason.
 *   rows  — the resolved scope's data, else the template's `_data`; when that is an array and both
 *           an index and a path are known, the row itself: from the document at the path first, else
 *           from the array. The second of those never ran in the suite.
 *
 * AN UNRESOLVED PATH STAYS UNRESOLVED ON PURPOSE. It cannot be derived from the data without guessing
 * an application's field names, and a wrong guess binds the popup to another table's row and writes
 * the user's edit there. A row-scoped popup states its scope in meta: either the Popup is declared
 * inside the row (`renderItem`/`TableCells`, which makes the registered `relativePath` the table
 * name), or the caller passes `{relativePath: '<table name>'}` in the `popupOpen` args. This warns
 * instead of guessing, so the misconfiguration is visible rather than silently rebinding fields.
 *
 * @param {Object} params
 * @param {String} params.id - the popup id, for the warning
 * @param {Object} [params.options] - the `popupOpen` options, possibly carrying the caller's scope
 * @param {{relativeIndex: ?Number, relativeData: *, relativePath: ?String}} params.scope - what
 *   `resolvePopupScope` resolved
 * @param {Object} params.template - the registered template
 * @param {Object} [params.props] - the UIRender instance's props
 * @param {*} [params.data] - the instance's data, used when the template carries none
 * @returns {{data: *, relativeIndex: ?Number, relativePath: ?String, rowData: *}}
 */
/** A registered popup template, as far as its scope is read. */
export type PopupTemplateScope = { data?: unknown, _data?: unknown, relativeIndex?: number | null, relativePath?: string | null }

/** What `resolvePopupRowContext` is given: see the parameters above. */
export type PopupRowContextArgs = {
    id: string
    options?: { relativeIndex?: number | null, relativePath?: string | null }
    scope: PopupScope
    template: PopupTemplateScope
    props?: ScopeProps
    data?: unknown
}

export function resolvePopupRowContext ({ id, options = {}, scope, template, props = {}, data }: PopupRowContextArgs) {
    const currentData = template.data || data
    const relativeIndex = options.relativeIndex != null
        ? options.relativeIndex
        : (scope.relativeIndex != null ? scope.relativeIndex : template.relativeIndex)
    const relativePath = options.relativePath != null
        ? options.relativePath
        : (scope.relativePath || props.relativePath || template.relativePath)

    if (!relativePath && relativeIndex != null) {
        console.warn(
            `POPUP_OPEN: "${id}" opened for row index ${relativeIndex} without a relativePath;`
            + ' its inputs bind to root-level field names instead of the table row.'
            + ' Declare the Popup inside the table row, or pass'
            + ' {relativePath: \'<table name>\'} in the popupOpen args.'
        )
    }

    let rowData: unknown = scope.relativeData != null ? scope.relativeData : template._data
    if (Array.isArray(rowData) && relativeIndex != null && relativePath) {
        const tableData = get(currentData, relativePath)
        if (Array.isArray(tableData) && tableData[relativeIndex] != null) {
            rowData = tableData[relativeIndex]
        } else if (rowData[relativeIndex] != null) {
            rowData = rowData[relativeIndex]
        }
    }

    return { data: currentData, relativeIndex, relativePath, rowData }
}
