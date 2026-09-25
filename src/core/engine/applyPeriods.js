import { messageFromError } from './apiError'
import { normalizeIncomingData } from './utils'

/**
 * WHAT AN `onApplyPeriods` ACTION DOES.
 * =============================================================================================
 *
 * Lifted out of the `config` getter at §9.3 step 2, the rest of what `apiError.js` started: every
 * form's current values go to the host's `apiCalls.updateExperienceData`, and whatever it resolves
 * with becomes the UI's data. A failure is read into a message by `messageFromError` and handed on.
 *
 * AN EMPTY ANSWER IS IGNORED — `undefined`, `null`, `''`, `0` — and the data is left as it was.
 * `upload.js` has the same guard now; before it did, an empty upload answer emptied the UI.
 *
 * @param {{updateExperienceData: Function, readFormsData: Function, onUpdated: Function,
 *   onFailure: Function}} options - the host's API call; a reader for every form's current values;
 *   what to do with the normalised answer; and what to do with a failure, given the message to show
 *   and the original error
 * @returns {Promise<false|undefined>} false when the host provides no `updateExperienceData`
 */
export async function applyPeriods ({ updateExperienceData, readFormsData, onUpdated, onFailure }) {
    if (typeof updateExperienceData !== 'function') {
        return false
    }
    const data = readFormsData()

    try {
        const response = await updateExperienceData(data)
        if (!response) {
            return
        }
        onUpdated(normalizeIncomingData(response))
    } catch (error) {
        // Not guarded, as before: a body that cannot be read rejects here, and the failure then
        // reaches neither the popup nor the console (see `apiError.js`).
        onFailure(await messageFromError(error), error)
    }
}
