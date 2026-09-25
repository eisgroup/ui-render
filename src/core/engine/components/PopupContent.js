import { PureComponent } from 'react'
import Render from '../index'

/**
 * THE CONTENT OF A POPUP OPENED FROM A TEMPLATE — its items rendered against one row.
 * =============================================================================================
 *
 * Lifted out of the `POPUP_OPEN` handler at §9.3 step 2, where the class was DECLARED INSIDE the
 * handler. It is still created fresh for every template popup, and that is deliberate: measured
 * while extracting this, one shared class breaks a visible behaviour. Open row 0's popup, type into
 * it, and open row 1's popup without closing the first: with a fresh type React remounts the
 * content and row 1's field shows row 1's value; with one shared type React updates the content in
 * place, the input keeps its DOM value, and row 1's field — correctly NAMED for row 1 — SHOWS row 0's
 * edit. The form data is right either way; what the user sees is not. `rules.popup-content.test.js`
 * pins it.
 *
 * A `key` per popup id would force the same remount with one type, but an id is only unique within
 * an instance: every nested document keeps its own `popupById`, and nothing stops two of them
 * producing the same id, where a key would bring the defect back. The fresh type is the one thing
 * guaranteed to differ.
 *
 * The class reads nothing but its props and `Render`, so nothing is lost by declaring it here. A
 * popup is cached in `popupById` once created, so re-opening the SAME id reuses its element, type and
 * all, exactly as before.
 *
 * @returns {Function} a new PureComponent class that renders `items` with the given row context
 */
export function createPopupContent () {
    return class PopupContent extends PureComponent {
        render () {
            // `relativeData` is deliberately not read: every mapped item below hardcodes
            // `relativeData: false` so Render never re-extracts by name.
            const { items, data, _data, form, instance, relativeIndex, relativePath, currencyCode } = this.props

            // Map items with current data context, similar to how Render.js does it
            // IMPORTANT: Always pass relativePath and relativeIndex to ensure correct field IDs
            // Set relativeData to false to prevent Render.js from automatically extracting data by name
            // This ensures _data remains the single row element, not the entire array
            const mappedItems = items.map((item) => {
                const mappedItem = {
                    ...item,
                    data,
                    _data,
                    form,
                    instance,
                    relativeIndex,
                    relativePath,
                    relativeData: false, // Prevent automatic data extraction by name in Render.js
                    currencyCode
                }
                // Ensure relativePath and relativeIndex are always set (not just for TableCells)
                // These are critical for generating correct field IDs in forms
                // Also set them in meta.relativePath and meta.relativeIndex so they are passed through metaToProps
                if (relativePath != null) {
                    mappedItem.relativePath = relativePath
                    // Set in meta object so metaToProps can access it
                    if (!mappedItem.meta) mappedItem.meta = {}
                    mappedItem.meta.relativePath = relativePath
                }
                if (relativeIndex != null) {
                    mappedItem.relativeIndex = relativeIndex
                    // Set in meta object so metaToProps can access it
                    if (!mappedItem.meta) mappedItem.meta = {}
                    mappedItem.meta.relativeIndex = relativeIndex
                }
                return mappedItem
            })
            // Pass relativePath and relativeIndex to Render component itself
            // This ensures they are available in Render.props and passed down correctly
            // Set relativeData to false to prevent Render.js from automatically extracting data by name
            // This ensures _data remains the single row element throughout the render tree
            // Add key prop to avoid React warning about missing keys
            return mappedItems.map((item, idx) => Render({
                ...item,
                relativePath,
                relativeIndex,
                relativeData: false, // Prevent automatic data extraction by name in Render.js
                key: item.id || item.name || `popup-item-${idx}`
            }))
        }
    }
}
