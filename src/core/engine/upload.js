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
 * Three things this does are pinned by `upload.test.js` and `rules.actions.test.js` rather than
 * changed here, because changing any of them changes what the host receives or what the user sees:
 *   - the file field is excluded by `delete data[path]`, a TOP-LEVEL key, so a dotted name such as
 *     `attachment.file` stays in the payload — as the field's value, a file list, which
 *     `JSON.stringify` writes as `[{}]`
 *   - only the first of several files is sent, even when the field allows `multiple`
 *   - the answer replaces the data wholesale, so a host that resolves with `undefined` or `null`
 *     leaves the engine with no data, and it renders an empty container — the upload control
 *     included, so the user cannot try again
 *
 * A failure is logged and nothing else: no popup, and the data is left as it was. Clearing the file
 * input on success is kept although the in-house `Dropzone` already clears it after every pick,
 * because `rules.actions.test.js` asserts it.
 *
 * @param {Array} args - `[files, path, dropzone]`, as `Upload` passes them
 * @param {{uploadFile: Function, readFormsData: Function, onUploaded: Function}} options - the
 *   host's API call; a reader for every form's current values, which must return a copy; and what to
 *   do with the normalised answer
 * @returns {Promise<void>} settles once the answer is handed over or the failure is logged
 */
export async function upload ([files, path, dropzone], { uploadFile, readFormsData, onUploaded }) {
    const [file] = files
    if (!file || typeof uploadFile !== 'function') return

    const data = readFormsData()
    delete data[path]
    try {
        const response = await uploadFile(JSON.stringify(data), file)
        const normalizedResponse = normalizeIncomingData(response)
        dropzone.fileInputEl.value = null
        onUploaded(normalizedResponse)
    } catch (error) {
        console.error(error)
    }
}
