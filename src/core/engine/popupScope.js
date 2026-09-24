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
 * @param {String} id - the popup id, possibly already interpolated (`edit.1`)
 * @param {Object} [form] - the form whose state the later sources read
 * @param {Object} [props] - the UIRender instance's props
 * @returns {{relativeIndex: ?Number, relativeData: *, relativePath: ?String}} the resolved scope
 */
export function resolvePopupScope ({ id, form, props = {} }) {
    // Try to get index and path from multiple sources
    let relativeIndex = null
    let relativeData = null
    let relativePath = null

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
    else if (relativeIndex == null && hasFormState && props.index != null) {
        relativeIndex = props.index
        relativeData = form.getState().values
        relativePath = props.relativePath
    }
    // 3. Try to extract from form path (e.g., "name[0]" -> 0 and "name")
    // Only if relativeIndex not already set
    else if (relativeIndex == null && hasFormState && props.relativePath) {
        const pathMatch = props.relativePath.match(/\[(\d+)\]/)
        if (pathMatch) {
            relativeIndex = parseInt(pathMatch[1], 10)
            // Extract base path (e.g. `orders.lines` from `orders.lines[0]`)
            relativePath = props.relativePath.replace(/\[\d+\]$/, '')
        } else {
            relativePath = props.relativePath
        }
        relativeData = form.getState().values
    }
    // 4. Try to extract index and path from form field names
    // Only if relativeIndex not already set
    else if (relativeIndex == null && hasFormState) {
        const formState = form.getState()
        const registeredFields = Object.keys(formState.values || {})
        // Look for field names that contain array indices
        for (const fieldName of registeredFields) {
            const match = fieldName.match(/^(.+)\[(\d+)\]/)
            if (match) {
                relativePath = match[1]
                relativeIndex = parseInt(match[2], 10)
                break
            }
        }
        relativeData = formState.values
    }

    return { relativeIndex, relativeData, relativePath }
}
