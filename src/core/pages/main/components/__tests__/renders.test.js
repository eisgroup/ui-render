// Force form module to fully resolve before importing renders, which transitively
// imports form/utils → pages/main/rules → withForm and hits a circular dep.
import '../../../../modules/form/utils'
import { renderField } from '../renders'
import { FIELD } from '../../../../modules/variables'
import {
    DropdownField,
    InputField,
    ToggleField,
    InputNumberField,
    InputDateField,
    SliderField,
} from '../../../../modules/form/inputs'

describe('renderField dispatcher', () => {
    it('renders InputField for INPUT type', () => {
        const node = renderField({ view: FIELD.TYPE.INPUT, name: 'a' }, 0)
        expect(node.type).toBe(InputField)
        expect(node.key).toBe('0')
    })

    it('renders DropdownField for SELECT type', () => {
        const node = renderField({ view: FIELD.TYPE.SELECT, name: 'a' }, 0)
        expect(node.type).toBe(DropdownField)
    })

    it('renders ToggleField for TOGGLE type', () => {
        const node = renderField({ view: FIELD.TYPE.TOGGLE, name: 'a' }, 0)
        expect(node.type).toBe(ToggleField)
    })

    it('renders SliderField for SLIDER type', () => {
        const node = renderField({ view: FIELD.TYPE.SLIDER, name: 'a' }, 0)
        expect(node.type).toBe(SliderField)
    })

    it('falls back to PlaceholderField for unknown view', () => {
        const node = renderField({ view: 'TotallyUnknown', name: 'a' }, 0)
        // PlaceholderField.bind returns a wrapper function — the resulting element type is a bound function
        expect(typeof node.type).toBe('function')
    })

    it('uses InputNumberField when type=number regardless of view', () => {
        const node = renderField({ view: FIELD.TYPE.INPUT, type: 'number', name: 'a' }, 0)
        expect(node.type).toBe(InputNumberField)
    })

    it('uses InputDateField when type=date regardless of view', () => {
        const node = renderField({ view: FIELD.TYPE.INPUT, type: 'date', name: 'a' }, 0)
        expect(node.type).toBe(InputDateField)
    })

    it('passes through props excluding view/type to the Field', () => {
        const node = renderField({ view: FIELD.TYPE.INPUT, type: 'text', name: 'a', label: 'My' }, 0)
        expect(node.props.name).toBe('a')
        expect(node.props.label).toBe('My')
        expect(node.props.view).toBeUndefined()
    })
})
