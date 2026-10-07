import { messageFromError } from './apiError'
import { normalizeIncomingData } from './dataMapping'

/**
 * WHAT AN `onApplyPeriods` ACTION DOES.
 * =============================================================================================
 *
 * Lifted out of the `config` getter at §9.3 step 2, the rest of what `apiError.ts` started: every
 * form's current values go to the host's `apiCalls.updateData`, and whatever it resolves with
 * becomes the UI's data. A failure is read into a message by `messageFromError` and handed on.
 *
 * AN EMPTY ANSWER IS IGNORED — `undefined`, `null`, `''`, `0` — and the data is left as it was.
 * `upload.ts` has the same guard now; before it did, an empty upload answer emptied the UI.
 *
 * @param {{updateData: Function, readFormsData: Function, onUpdated: Function,
 *   onFailure: Function}} options - the host's API call; a reader for every form's current values;
 *   what to do with the normalised answer; and what to do with a failure, given the message to show
 *   and the original error
 * @returns {Promise<false|undefined>} false when the host provides no `updateData`
 */
/** What `applyPeriods` is given: see the parameter above. */
export type ApplyPeriodsOptions = {
    updateData?: (data: unknown) => unknown
    readFormsData: () => unknown
    onUpdated: (data: unknown) => void
    onFailure: (message: unknown, error: unknown) => void
}

export async function applyPeriods ({ updateData, readFormsData, onUpdated, onFailure }: ApplyPeriodsOptions): Promise<false | undefined> {
    if (typeof updateData !== 'function') {
        return false
    }
    const data = readFormsData()

    try {
        const response = await updateData(data)
        if (!response) {
            return
        }
        onUpdated(normalizeIncomingData(response))
    } catch (error) {
        // Not guarded, as before: a body that cannot be read rejects here, and the failure then
        // reaches neither the popup nor the console (see `apiError.ts`).
        onFailure(await messageFromError(error), error)
    }
}
