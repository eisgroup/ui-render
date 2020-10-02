import { asField } from 'modules-pack/form'
import React from 'react'
import { Dropdown } from 'react-ui-pack/Dropdown'

/**
 * Dropdown Field connected with react-final-form or redux-form
 */
export default asField(Dropdown, {sanitize: (value, {multiple}) => value === '' ? (multiple ? [] : '') : value})
