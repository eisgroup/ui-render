import { asField } from 'ui-modules-pack/form'
import UploadGrid from 'ui-modules-pack/upload/views/UploadGrid'

/**
 * Upload Grid Field connected with react-final-form
 * @note: use `fileParser` for processing mutation variables.
 * @example: // requests.js
 *    if (entry.files) entry.files = fileParser(entry.files)
 *
 * How it works:
 * - When form loads with existing files from server, and no changes made,
 *   need to delete the field from mutation variables, because form value contains all files from server response.
 * - When user removes or updates a file, form value changes to list of only updated files.
 *   => this is fine because backend only updates given files, others remain unchanged.
 */
export default asField(UploadGrid, {sanitize: (value) => value || undefined})
