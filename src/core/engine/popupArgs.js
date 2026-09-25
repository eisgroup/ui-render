/**
 * WHAT A `popupOpen` ACTION WAS ACTUALLY ASKED TO OPEN.
 * =============================================================================================
 *
 * The first thirty-seven lines of the `POPUP_OPEN` handler, lifted out at §9.3 step 2. A meta
 * author writes `onClick: {name: 'popupOpen', args: [...]}`, and by the time those arguments arrive
 * the caller has prepended its own — a click event, sometimes a component class — and the author's
 * may be a bare id, an id and options, or a single options object carrying the id. Deciding which
 * is the one thing here that is a calculation.
 *
 * WHY THE CALLER'S ARGUMENTS ARE THERE AT ALL: `getFunctionFromString` APPENDS a meta's configured
 * arguments to whatever the caller passes, so a `Button`'s click event is always argument one. The
 * same appending is what makes the state path "the last string argument" over in `setStates`.
 *
 * The logging stays here rather than moving to the call site: both messages describe a malformed
 * call, not engine state, and splitting them from the decision that produces them would leave two
 * places to keep in step.
 *
 * @param {Array} args - everything the action was called with, caller's arguments first
 * @returns {?{id: String, options: Object}} the popup to open, or null when the call is unusable
 */
export function parsePopupArgs (args) {
    // Filter out event objects (React SyntheticEvent or native Event)
    const filteredArgs = args.filter(arg => {
        // React component classes are functions, so check them before the generic primitive branch.
        if (arg && arg.prototype && arg.prototype.isReactComponent) {
            return false
        }
        if (typeof arg !== 'object' || arg === null) return true
        // Check if it's an event object
        if (arg.nativeEvent || arg.target || arg.preventDefault || arg.stopPropagation) {
            return false
        }
        return true
    })

    // Handle different argument formats: [id, options] or [id] or [options with id]
    let id
    let options = {}
    if (filteredArgs.length === 0) {
        console.error('Popup Open: no arguments provided after filtering')
        return null
    }
    if (typeof filteredArgs[0] === 'string') {
        id = filteredArgs[0]
        options = filteredArgs[1] || {}
    } else if (typeof filteredArgs[0] === 'object' && filteredArgs[0] !== null) {
        // If first arg is object, it might be options with id, or just options
        options = filteredArgs[0]
        id = filteredArgs[1] || options.id
    } else {
        // A number, a boolean: `popupOpen,7` is a legal thing for a meta to write.
        id = String(filteredArgs[0])
        options = filteredArgs[1] || {}
    }

    // Ensure id is a string
    if (typeof id !== 'string' || !id) {
        console.error('Popup Open: id must be a non-empty string, got:', typeof id, id)
        return null
    }

    return { id, options }
}
