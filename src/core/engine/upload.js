import { unset } from '../utils/object'
import { normalizeIncomingData } from './utils'

/**
 * WHAT AN `upload` ACTION SENDS, AND WHAT IT DOES WITH THE ANSWER.
 * =============================================================================================
 *
 * Lifted out of the `config` getter at §9.3 step 2. A file field writes `onChange: 'upload'`, and
 * `Upload` calls it with `(files, name, dropzone)` once the files pass its size check. The host's
 * `apiCalls.uploadFile` receives every form's current values as JSON, minus the file field, plus
 * the file; whatever it resolves with becomes the UI's data.
 *
 * AN EMPTY ANSWER IS IGNORED — `undefined`, `null`, `''`, `0` — and the data is left as it was, as
 * `onApplyPeriods` always did. Until this was fixed the answer replaced the data wholesale: with
 * `undefined` or `null` the engine had no data and rendered an empty container, the upload control
 * included, so the user could not try again; with `''` or `0` every form value was wiped.
 *
 * THE FILE FIELD IS EXCLUDED BY PATH, so a dotted name such as `attachment.file` is taken out of
 * the nested object. Until that was fixed it was `delete data[path]`, a TOP-LEVEL key, and the field
 * stayed in the payload as its value — the picked file list, which `JSON.stringify` writes as `[{}]`.
 *
 * THE HOST GETS EVERY PICKED FILE AS A THIRD ARGUMENT, `uploadFile(serialized, file, files)`, and
 * the first as the second, as before. Until that was added only the first of several reached the
 * host even when the field allowed `multiple`; the third argument is additive, so a host written
 * for `(serialized, file)` sees no difference.
 *
 * A failure is logged and nothing else: no popup, and the data is left as it was. Clearing the file
 * input on success is kept although the in-house `Dropzone` already clears it after every pick,
 * because `rules.actions.test.js` asserts it.
 *
 * @param {Array} args - `[files, path, dropzone]`, as `Upload` passes them
 * @param {{uploadFile: Function, readFormsData: Function, onUploaded: Function}} options - the
 *   host's API call; a reader for every form's current values, which must return a copy; and what to
 *   do with the normalised answer
 * @returns {Promise<void>} settles once the answer is handed over or ignored, or the failure logged
 */
export async function upload ([files, path, dropzone], { uploadFile, readFormsData, onUploaded }) {
    const [file] = files
    if (!file || typeof uploadFile !== 'function') return

    const data = readFormsData()
    unset(data, path)
    try {
        const response = await uploadFile(JSON.stringify(data), file, files)
        dropzone.fileInputEl.value = null
        if (!response) return
        onUploaded(normalizeIncomingData(response))
    } catch (error) {
        console.error(error)
    }
}
