import { downloadFile as saveBlob } from '../services/downloadFile'

/**
 * WHAT A `download` ACTION DOES.
 * =============================================================================================
 *
 * Lifted out of the `config` getter at §9.3 step 2. A meta writes
 * `onClick: {name: 'download', args: ['report.csv']}`; the host's `apiCalls.downloadFile` fetches
 * the file, and the response body is saved in the browser under the same name.
 *
 * THE FIRST ARGUMENT IS DROPPED WHEN IT IS AN OBJECT, because `getFunctionFromString` appends the
 * meta's arguments to the caller's and a `Button` passes its click event first. The test is the
 * original's, kept exactly: ANY object, `null` included, is taken for the event, and only one is
 * dropped. `parsePopupArgs` recognises events properly; making this match would change which
 * calls reach the host, which is not what an extraction is for.
 *
 * THE FIRST REMAINING ARGUMENT IS WHAT THE HOST IS ASKED FOR, AND A SECOND ONE, WHEN IT IS A
 * NON-EMPTY STRING, IS THE NAME TO SAVE AS; without it the file is saved under the name it was
 * requested by. That second argument is what this action took until 2022-11, when it stopped
 * downloading URLs itself and began calling the host's `downloadFile`, and the switch silently
 * dropped it — the demo's `button-download_meta.js` kept passing one. Restored 2026-09-25.
 *
 * `downloadFile` is called exactly as before, with no `this`, so a host that throws synchronously
 * or returns something other than a promise still fails loudly instead of reaching `onFailure`.
 *
 * @param {Array} args - everything the action was called with, caller's arguments first
 * @param {{downloadFile: Function, onFailure: Function}} options - the host's API call, and what
 *   to do with a failed fetch or save
 * @returns {false|Promise<void>} false when the host provides no `downloadFile`; otherwise a promise
 *   that settles once the file is saved or the failure is handed over. The original returned
 *   nothing here, and no caller reads the value: a `Button` hands `onClick` straight to the DOM.
 */
export function download (args, { downloadFile, onFailure }) {
    const [fileName, saveAs] = typeof args[0] === 'object' ? args.slice(1) : args
    if (typeof downloadFile !== 'function') return false

    return downloadFile(fileName)
        .then(response => response.blob())
        .then(saveBlob(typeof saveAs === 'string' && saveAs ? saveAs : fileName))
        .catch(onFailure)
}
