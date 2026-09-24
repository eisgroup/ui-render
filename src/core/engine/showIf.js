import { get, hasObjectValue, isEqual, isObject, mergeReplaceArrays } from '../utils/object'
import { interpolateString, isString, isTruthy } from '../utils'

/**
 * WHETHER A META NODE RENDERS AT ALL — the `showIf` attribute, decided in one place.
 * =============================================================================================
 *
 * Lifted out of `RenderComponent` at §9.3 step 2, where it was the first fifty lines of a function
 * that is seven hundred long and had no way to be exercised except by rendering a tree. It is a
 * function of its arguments: it reads nothing module-level and writes nothing.
 *
 * It lives in the engine rather than in `ui-utils-pack`, which is where the step's wording points.
 * `showIf` is meta semantics, not a general-purpose helper — putting it under `utils` would place
 * engine logic BELOW the layer that uses it, the same reason `errorsProcessing` stayed here when
 * the registries moved out.
 *
 * `instance` is an argument like any other. It is read twice, and only to ask the engine two
 * questions the node cannot answer itself: what `{state.xxx}` interpolates to, and what the live
 * form holds.
 *
 * @param {*} showIf - the node's `showIf`, in any of its three accepted shapes
 * @param {Object} data - the document's data
 * @param {*} _data - the local data this node was rendered against
 * @param {Boolean} [relativeData] - whether the node reads from `_data`; `false` forces the root
 * @param {String} [relativePath] - path prefix when the node is rendered inside an array
 * @param {Number|String} [relativeIndex] - row index when the node is rendered inside an array
 * @param {Object} [instance] - the UIRender instance, for `{state.xxx}` and live form values
 * @returns {Boolean} whether the node should render
 */
export function shouldRender ({ showIf, data, _data, relativeData, relativePath, relativeIndex, instance }) {
    if (showIf == null) return true

    // UI Render should not 'Value Transform' `showIf` attribute
    if (isString(showIf)) {
        return isTruthy(get((relativeData !== false && _data) || data, showIf))
    }

    if (hasObjectValue(showIf)) {
        const { name: rawName, relativeData: showIfRelativeData, equal } = showIf
        // Interpolate {state.xxx} templates in showIf.name
        const name = rawName && rawName.includes('{')
            ? interpolateString(rawName, instance, { suppressError: true })
            : rawName
        let __data
        if (name) {
            // Use raw form data (without Select array reordering) for showIf lookups.
            // getAllFormsData() applies changeOptionOrderForSelectFields which reorders arrays,
            // but {state.xxx} stores indices relative to the original array order.
            // Merge with `data` so an empty or partial `{}` from the form does not hide nodes whose
            // showIf keys exist only on initialValues (e.g. root layout gated by a data flag).
            // Note: lodash mergeWith skips undefined source values, so a form field explicitly
            // cleared to undefined will still show the initial data value. This is acceptable
            // because showIf targets are typically layout flags from data, not editable form fields.
            const rawForm = instance && instance.getRawFormsData && instance.getRawFormsData()
            const formData = (rawForm != null && typeof rawForm === 'object')
                ? mergeReplaceArrays(data, rawForm)
                : data
            // Draft row / renderExtraItem sets relativePath + relativeIndex to the next array slot.
            // showIf.name may still be a global path (e.g. `settings.allRowsComplete`).
            // In that case prefixing with `[index].` is wrong — use showIf.relativeData === false or
            // component relativeData === false to read `name` from form root.
            if (
                relativePath && typeof relativeIndex !== 'undefined' &&
                showIfRelativeData !== false && relativeData !== false
            ) {
                __data = get(formData, `${relativePath}[${relativeIndex}].${name}`, undefined)
            } else {
                __data = get(formData, name, undefined)
            }
        } else {
            // Get from initial data.
            // TODO: review this logic. It might be better to get from form instead of initial data
            __data = (showIfRelativeData !== false && !name && _data) || get((showIfRelativeData !== false && _data) || data, name)
        }
        return equal !== undefined ? isEqual(__data, equal) : isTruthy(__data)
    }

    if (isObject(showIf)) return isTruthy(_data)

    // A `showIf` that is neither a string nor an object — a number, a boolean — gates nothing.
    // Preserved rather than tightened: the previous code fell through every branch and rendered.
    return true
}
