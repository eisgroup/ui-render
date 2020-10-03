import { asField } from 'modules-pack/form'
import UploadGrid from 'modules-pack/upload/views/UploadGrid'
import React from 'react'

/**
 * Upload Grid Field connected with react-final-form or redux-form
 */
export default asField(UploadGrid, {sanitize: (value) => value || []})
