import { asField } from 'modules-pack/form'
import UploadGrids from 'modules-pack/upload/views/UploadGrids'
import React from 'react'

/**
 * Upload Grids Field connected with react-final-form or redux-form
 */
export default asField(UploadGrids, {sanitize: (value) => value || []})
