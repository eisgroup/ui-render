import { asField } from 'modules-pack/form'
import React from 'react'
import Dates from 'react-ui-pack/inputs/Dates'

/**
 * Dates From - To Fields connected with react-final-form or redux-form
 */
export default asField(Dates, {sanitize: (value) => value || []})
