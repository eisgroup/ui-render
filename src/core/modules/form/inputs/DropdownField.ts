import { asField } from '..'
import type { AsFieldProps } from '../utils'
import { Dropdown } from '../../../components/Dropdown'

/**
 * Dropdown Field connected with react-final-form
 */
export default asField(Dropdown, {
  sanitize: (value: unknown, { multiple }: AsFieldProps) => {
    return value === '' ? (multiple ? [] : '') : value
  }})
