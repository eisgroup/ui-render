/**
 * WHAT TO SHOW THE USER WHEN AN API CALL FAILS.
 * =============================================================================================
 *
 * Lifted out of the `onApplyPeriods` action at §9.3 step 2, where it was thirty-five of the
 * handler's sixty lines and could only be reached by making a real call fail. Everything around it
 * is a command — call the API, set state, open a popup — and this is the one calculation.
 *
 * A `fetch` rejection is not an Error: hosts hand back the `Response`, whose body has to be read
 * before anything can be said about it, which is why this is async.
 *
 * THE BODY IS NOT RELIABLY JSON, and the shapes below are the ones this has met:
 *   - valid JSON with a `message` — the message is used
 *   - valid JSON without one — the whole object is used, and `Json` renders it
 *   - a message that embeds `message=…errors…` — only the part before `errors` is meaningful
 *   - bare-KEY pseudo-JSON — only when the body does not parse as it is, the keys are quoted and
 *     parsing tried again, which rescues a body whose values are already quoted and nothing else:
 *     `{message: Row is locked}` still fails and is shown as text
 *   - plain text — used as-is
 *   - a body that parses to something falsy — the error itself, as before
 *
 * @param {*} error - what the call rejected with
 * @returns {Promise<*>} the message to display: a string, a parsed object, or the error itself
 */
export async function messageFromError (error) {
    // Anything that is not a Response speaks for itself.
    if (typeof Response === 'undefined' || !(error instanceof Response)) return error

    // Deliberately not guarded: a body that cannot be read rejected before this code existed too,
    // and turning that into a displayed message would be a behaviour change, not an extraction.
    const errorText = await error.text()

    let errorObject
    try {
        errorObject = JSON.parse(errorText)
    } catch {
        try {
            // Some APIs return `{message: ...}` rather than JSON, so quote bare keys and try again.
            // Only as a fallback: run over a body that WAS valid JSON, the pass also quoted every
            // `word:` inside its string values — a URL's `http:`, an embedded `{code:12}` — broke the
            // JSON that contained them, and the user was shown the raw body. Fixed 2026-09-25.
            errorObject = JSON.parse(errorText.replace(/(\w+:)|(\w+ :)/g, function (s) {
                return '"' + s.substring(0, s.length - 1) + '":'
            }))
        } catch {
            // Some APIs return a plain-text error body instead of JSON.
            return errorText || error
        }
    }

    // A body that parses to something falsy (`null`, `0`, `""`) leaves the error itself as the
    // message — the original's `if (errorObject)` guard simply did not fire.
    if (!errorObject) return error
    if (!errorObject.message) return errorObject

    const message = errorObject.message
    // `message=<what went wrong>errors=[…]` — only the first half is worth showing.
    if (/message=(.*)errors.*/.test(message)) {
        const subMessage = message.match(/message=(.*)errors.*/)[1]
        if (subMessage) return subMessage
    }
    return message
}
