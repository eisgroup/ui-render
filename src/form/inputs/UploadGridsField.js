import { asField } from 'modules-pack/form'
import UploadGrids from 'modules-pack/upload/views/UploadGrids'
import React from 'react'

/**
 * @see UploadGridField for docs.
 */
export default asField(UploadGrids, {sanitize: (value) => value || []})
