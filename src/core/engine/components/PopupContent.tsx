import React, { memo } from 'react'
import RenderJs from '../index'

/**
 * The renderer is still JavaScript (§9.6-E3), re-typed as what this file calls it with. Cast where it is
 * called, not in a module-level constant: the engine's modules import each other in a cycle, and only a
 * read at render is guaranteed to see the import's live binding (Data.tsx measured the difference).
 */
type RenderFunction = (props: Record<string, unknown>) => React.ReactNode

/** A meta item as this component forwards it: only its identity and its `meta` are touched here. */
type PopupItem = { id?: string, name?: string, meta?: Record<string, unknown>, [key: string]: unknown }

export type PopupContentProps = {
    items: PopupItem[]
    data?: unknown
    _data?: unknown
    form?: unknown
    instance?: unknown
    relativeIndex?: number | null
    relativePath?: string | null
    /** Accepted and deliberately not read, see below */
    relativeData?: boolean
    currencyCode?: string
}

/**
 * THE CONTENT OF A POPUP OPENED FROM A TEMPLATE — its items rendered against one row.
 * =============================================================================================
 *
 * Lifted out of the `POPUP_OPEN` handler at §9.3 step 2, where the class was DECLARED INSIDE the
 * handler, and a memoized function since §9.2 (`memo` skips a render with shallow-equal props, as
 * `PureComponent` did). It is still created fresh for every template popup, and that is deliberate: measured
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
 * The component reads nothing but its props and `Render`, so nothing is lost by declaring it here. A
 * popup is cached in `popupById` once created, so re-opening the SAME id reuses its element, type and
 * all, exactly as before.
 *
 * @returns {Function} a new memoized component that renders `items` with the given row context
 */
export function createPopupContent () {
    return memo(function PopupContent (props: PopupContentProps) {
        // `relativeData` is deliberately not read: every mapped item below hardcodes
        // `relativeData: false` so Render never re-extracts by name.
        const { items, data, _data, form, instance, relativeIndex, relativePath, currencyCode } = props
        const Render = RenderJs as unknown as RenderFunction

        // Map items with current data context, similar to how Render.tsx does it
        // IMPORTANT: Always pass relativePath and relativeIndex to ensure correct field IDs
        // Set relativeData to false to prevent Render.tsx from automatically extracting data by name
        // This ensures _data remains the single row element, not the entire array
        const mappedItems = items.map((item) => {
            const mappedItem: PopupItem = {
                ...item,
                data,
                _data,
                form,
                instance,
                relativeIndex,
                relativePath,
                relativeData: false, // Prevent automatic data extraction by name in Render.tsx
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
        // Set relativeData to false to prevent Render.tsx from automatically extracting data by name
        // This ensures _data remains the single row element throughout the render tree
        // Add key prop to avoid React warning about missing keys
        return mappedItems.map((item, idx) => Render({
            ...item,
            relativePath,
            relativeIndex,
            relativeData: false, // Prevent automatic data extraction by name in Render.tsx
            key: item.id || item.name || `popup-item-${idx}`
        }))
    })
}
