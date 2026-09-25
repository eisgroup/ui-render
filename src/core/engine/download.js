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
 * Only the first remaining argument is read. Until 2022-11 this action downloaded a URL itself and
 * took a second argument, the name to save as; the switch to the host's `downloadFile` dropped it.
 * The demo's `button-download_meta.js` still passes one, and it is still ignored — pinned by
 * `download.test.js` rather than restored here, since restoring it changes the saved file's name
 * for every meta that copied the demo.
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
    const [fileName] = typeof args[0] === 'object' ? args.slice(1) : args
    if (typeof downloadFile !== 'function') return false

    return downloadFile(fileName)
        .then(response => response.blob())
        .then(saveBlob(fileName))
        .catch(onFailure)
}
