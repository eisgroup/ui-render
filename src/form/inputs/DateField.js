import { asField } from 'modules-pack/form'
import React from 'react'
import { Field } from 'react-final-form'
import DateInput from 'react-ui-pack/inputs/DateInput'
import { Active } from 'utils-pack'

if (!Active.Field) Active.Field = Field

/**
 * Date Field connected with react-final-form or redux-form
 * do not pass `validate` prop because DateInput's internal value is representation of time in date string
 */
export default asField(DateInput, {sanitize: (value) => Number(value)})
