import { asField } from 'modules-pack/form'
import UploadGrid from 'modules-pack/upload/views/UploadGrid'
import React from 'react'

/**
 * Upload Grid Field connected with react-final-form or redux-form.
 * @note: use `parse: fileParser` when defining form input, and processing mutation variables.
 * @example: // requests.js
 *    if (entry.files) entry.files = fileParser(entry.files)
 *
 * How it works:
 * - When form loads with existing files from server, and no changes made,
 *   need to delete the field from mutation variables, because form value contains all files from server response.
 * - When user removes or updates a file, form value changes to list of only updated files.
 *   => this is fine because backend only updates given files, others remain unchanged.
 */
export default asField(UploadGrid, {sanitize: (value) => value || []})
