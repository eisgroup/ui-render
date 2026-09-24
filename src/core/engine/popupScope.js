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
 * below, and nothing ever set that prop on an engine instance — `Data.js` passes `index` and
 * `relativeIndex` to a nested UIRender but puts the path in `meta`, and the only other
 * `relativePath=` in the engine goes to a `Render`, not to a UIRender. Its condition could not be
 * true, so cases fell past it to the last source, and removing it changes nothing.
 *
 * The other three were measured over the whole suite and NOT removed, which is the opposite of
 * what §9.3 predicted: sources 1 and 2 never fire in any test, but `Data.js` does set the props
 * they read, so they are reachable in a nested document and merely uncovered. Deleting them on the
 * strength of "no test hits this" would have been a live behaviour change.
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
