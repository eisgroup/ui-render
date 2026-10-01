import { asField } from '..'
import { Dropdown } from '../../../components/Dropdown'

/**
 * Dropdown Field connected with react-final-form
 */
export default asField(Dropdown, {
  sanitize: (value: unknown, { multiple }: { multiple?: boolean }) => {
    return value === '' ? (multiple ? [] : '') : value
  }})
