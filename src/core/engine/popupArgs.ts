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
 * The `popup` action's arguments arrive the same way, so what it shows is decided here too, by
 * `parsePopupAlertArgs` at the end of the module.
 *
 * @param {Array} args - everything the action was called with, caller's arguments first
 * @returns {?{id: String, options: Object}} the popup to open, or null when the call is unusable
 */
/**
 * A popup's options, as a meta writes them: `id` names the popup when the first argument does not, and
 * a caller's `relativeIndex`/`relativePath` scope it to a row (see `popupScope.ts`).
 */
export type PopupOptions = { id?: unknown, relativeIndex?: number | null, relativePath?: string | null, [key: string]: unknown }

export function parsePopupArgs (args: unknown[]): { id: string, options: PopupOptions } | null {
    const filteredArgs = args.filter(arg => !isCallerArgument(arg))

    // Handle different argument formats: [id, options] or [id] or [options with id]
    // Casts below, not guards: an argument after the id is the options object a meta writes.
    let id: unknown
    let options: PopupOptions = {}
    if (filteredArgs.length === 0) {
        console.error('Popup Open: no arguments provided after filtering')
        return null
    }
    if (typeof filteredArgs[0] === 'string') {
        id = filteredArgs[0]
        options = (filteredArgs[1] || {}) as PopupOptions
    } else if (typeof filteredArgs[0] === 'object' && filteredArgs[0] !== null) {
        // If first arg is object, it might be options with id, or just options
        options = filteredArgs[0] as PopupOptions
        id = filteredArgs[1] || options.id
    } else {
        // A number, a boolean: `popupOpen,7` is a legal thing for a meta to write.
        id = String(filteredArgs[0])
        options = (filteredArgs[1] || {}) as PopupOptions
    }

    // Ensure id is a string
    if (typeof id !== 'string' || !id) {
        console.error('Popup Open: id must be a non-empty string, got:', typeof id, id)
        return null
    }

    return { id, options }
}

/**
 * Whether an argument is one a CALLER prepends, never one a meta author writes: an event (React's
 * SyntheticEvent or a native one), or a React component class. Both popup actions drop them.
 *
 * @param {*} arg - one argument an action was called with
 * @returns {Boolean} true for an event or a component class
 */
/** What `isCallerArgument` looks for: an event's marks, or a component class's prototype flag. */
type CallerProbe = {
    prototype?: { isReactComponent?: unknown }
    nativeEvent?: unknown
    target?: unknown
    preventDefault?: unknown
    stopPropagation?: unknown
}

export function isCallerArgument (value: unknown): boolean {
    // A cast, not a guard: the argument is only probed for those marks.
    const arg = value as CallerProbe | null | undefined
    // React component classes are functions, so check them before the generic primitive branch.
    if (arg && arg.prototype && arg.prototype.isReactComponent) return true
    if (typeof arg !== 'object' || arg === null) return false
    return Boolean(arg.nativeEvent || arg.target || arg.preventDefault || arg.stopPropagation)
}

/**
 * WHAT A `popup` ACTION SHOWS: the title and the content it hands `popupAlert`.
 *
 * Its arguments arrive as `popupOpen`'s do, the caller's first. For a `Button` that is its click
 * event, which is dropped here: an event is not something to show, and as a title it is not even a
 * valid React child. In an action chain it is the previous step's result, as in the `fetch` chain
 * that `src/demo/markdowns/config.md` documents: `onDone: {name: 'popup', args: ['…']}`.
 *
 * Of what is left, a first argument that is text is the title and the second is the content, so
 * `'popup,Saved,All changes are stored'` reads as it is written. A first argument that is not
 * text cannot be a title, so it is the content, a chain step's result, and the text after it, if
 * any, is the title.
 *
 * @param {Array} args - everything the action was called with, caller's arguments first
 * @returns {{title: *, content: *}} the title and the content to show
 */
export function parsePopupAlertArgs (args: unknown[]): { title: unknown, content: unknown } {
    const [first, second] = args.filter(arg => !isCallerArgument(arg))
    if (typeof first === 'string') return { title: first, content: second }
    return { title: typeof second === 'string' ? second : undefined, content: first }
}
