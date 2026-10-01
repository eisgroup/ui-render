import { asField } from '..'
import { Slider } from '../../../components/Slider'

/**
 * Slider Field connected with react-final-form.
 * Accepts both a single number or an array `[from, to]` for a range slider.
 */
export default asField(Slider)
