/**
 * META PATH GRAMMAR ===========================================================
 *
 * One implementation of the JSON path notation both halves of the §9.4 contract
 * work speak: the dev-mode validator (`validateMeta.js`), which reports where a
 * meta document is wrong, and the render boundary (`Render.js`), which reports
 * where a document failed while rendering. Somebody who has learned to read
 * `items[3].items[0].name` in one message can read it in the other, and there is
 * one place to change if the notation ever has to change.
 *
 * The notation is the usual JSON path shape: object keys joined with `.`, array
 * indices in brackets, everything relative to the meta root — which is the empty
 * string, because a root-relative path reads better in a message than one with a
 * `$.` in front of it.
 * -----------------------------------------------------------------------------
 */

/**
 * Append `key` to a parent JSON path, producing `items[3].items[0].name`.
 *
 * @param {String} path - parent path ('' for the document root)
 * @param {String|Number} key - object key, or array index when `index` is true
 * @param {Boolean} [index] - whether `key` is an array index
 * @returns {String} path
 */
export function joinPath (path, key, index) {
    if (index) return `${path}[${key}]`
    return path ? `${path}.${key}` : String(key)
}

/**
 * Path of the child at `index` of a node's `items` array — the recursive backbone
 * every rendered node travels down.
 *
 * An absent `index` means the caller cannot say where the child sits: the node was
 * built by a component rather than by `items.map(Render)`, or it is the document root.
 * The closest enclosing path is then the most precise answer available, and naming it
 * is more useful than inventing a position.
 *
 * @Note: the segment is the position the CALLER supplied. That is the `items` index for
 * the recursive backbone and for table cells, where nearly every node comes from; a
 * value-definition renderer (`transforms.js`) supplies the row index of the value it is
 * rendering instead, so under one of those the last segment names a row rather than an
 * `items` slot. Everything left of it still locates the declaration.
 *
 * @param {String} path - path of the enclosing node ('' for the document root)
 * @param {Number|String} [index] - position of the child in the parent's `items`
 * @returns {String} path of the child, or `path` itself when the position is unknown
 */
export function childItemPath (path, index) {
    if (index == null) return path
    return joinPath(joinPath(path, 'items'), index, true)
}

/**
 * @param {String} path - meta path, '' for the document root
 * @returns {String} the path as it should appear inside a diagnostic message
 */
export function formatMetaPath (path) {
    return path ? `"${path}"` : 'the meta root'
}
