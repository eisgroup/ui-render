import { asField } from 'ui-modules-pack/form'
import React from 'react'
import Dates from 'ui-react-pack/inputs/Dates'

/**
 * Dates From - To Fields connected with react-final-form or redux-form
 */
export default asField(Dates, {sanitize: (value) => value || []})
