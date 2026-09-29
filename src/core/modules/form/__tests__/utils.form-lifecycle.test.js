import { Component } from 'react'
import { Active } from '../../../utils'
import {
    asField,
    fieldValues,
    registeredFieldErrors,
    registeredFieldValues,
    withFormSetup,
} from '../utils'

// What the form wrapper does, touched fields and storage included, is pinned on real documents in
// `utils.with-form.test.js`. The tests that constructed the wrapper class went when it became a
// function (§9.3 step 6, slice 5).

// `errorsProcessing` is no longer imported by the form module — the engine hands it in. This
// records the calls the decorator makes, which is the contract that replaced the import.
const processErrorsCalls = []
const processErrors = (...args) => { processErrorsCalls.push(args) }

function createFormApi ({ values = {}, registered = [], fieldStates = {} } = {}) {
    const listeners = []
    const unsubscribe = jest.fn()
    const form = {
        getState: jest.fn(() => ({ values })),
        getRegisteredFields: jest.fn(() => registered),
        getFieldState: jest.fn(name => fieldStates[name] || {}),
        mutators: { setFieldTouched: jest.fn() },
        reset: jest.fn(),
        subscribe: jest.fn((listener, subscription) => {
            listeners.push({ listener, subscription })
            return unsubscribe
        }),
    }
    return { form, listeners, unsubscribe }
}

function createSetupInstance ({
    initialValues = {},
    values = {},
    registered = [],
    fieldStates = {},
    props = {},
} = {}) {
    class FormContent extends Component {}

    // The subclass it returns, since §9.3 step 5: `FormContent` itself is left as written.
    const FormLayer = withFormSetup(FormContent, {
        fieldValues,
        registeredFieldValues,
        registeredFieldErrors,
        processErrors,
    })

    const { form } = createFormApi({ values, registered, fieldStates })
    const owner = { form, handleSubmit: jest.fn() }
    const componentProps = {
        initialValues,
        formProps: { pristine: true },
        instance: owner,
        ...props,
    }
    const instance = new FormLayer(componentProps)
    instance.state = { ...FormLayer.prototype.state }
    instance.setState = jest.fn(update => {
        const next = typeof update === 'function' ? update(instance.state, instance.props) : update
        instance.state = { ...instance.state, ...next }
    })

    return { form, instance, owner }
}

describe('form data synchronization contracts', () => {
    let originalRenderField

    beforeAll(() => {
        originalRenderField = Active.renderField
        Active.renderField = Active.renderField || (() => null)
    })

    afterAll(() => {
        Active.renderField = originalRenderField
    })

    it('writes a parsed value to the current registered name instead of a stale input callback', () => {
        const Input = () => null
        const FieldComponent = asField(Input)
        const owner = { form: { change: jest.fn() } }
        const staleOnChange = jest.fn()
        const onChange = jest.fn()
        const parse = jest.fn(value => value.trim())
        const instance = new FieldComponent({
            name: 'rows[0].amount',
            instance: owner,
            onChange,
            parse,
        })
        instance.input = {
            name: 'rows[1].amount',
            onChange: staleOnChange,
        }
        instance.hasFocus = true

        expect(instance.value).toBe('')
        instance.handleChange(' 42 ', 'user-input')

        expect(instance.value).toBe(' 42 ')
        expect(parse).toHaveBeenCalledWith(' 42 ')
        expect(owner.form.change).toHaveBeenCalledWith('rows[1].amount', '42')
        expect(staleOnChange).not.toHaveBeenCalled()
        expect(onChange).toHaveBeenCalledWith('42', 'user-input')
    })

    it('uses parent form controls when a nested setup instance has no direct owner', () => {
        class NestedFormContent extends Component {}
        const NestedFormLayer = withFormSetup(NestedFormContent, {
            fieldValues,
            registeredFieldValues,
            registeredFieldErrors,
        })
        const parent = { form: createFormApi().form, handleSubmit: jest.fn() }
        const instance = new NestedFormLayer({
            parent,
            initialValues: {},
            formProps: { pristine: true },
        })

        expect(instance.form).toBe(parent.form)
        expect(instance.handleSubmit).toBe(parent.handleSubmit)
    })

    it('blocks saving for loading and validation errors and avoids duplicate state publications', () => {
        const onDataChanged = jest.fn()
        const onChangeState = jest.fn()
        const { instance } = createSetupInstance({
            initialValues: { name: 'before' },
            values: { name: 'after' },
            registered: ['name'],
            fieldStates: { name: { error: 'Invalid' } },
            props: {
                formProps: { pristine: false },
                onDataChanged,
                onChangeState,
            },
        })

        expect(instance.canSave).toBe(false)
        instance.syncInputChanges()
        instance.syncInputChanges()

        expect(onDataChanged).toHaveBeenCalledTimes(2)
        expect(instance.setState).not.toHaveBeenCalled()
        expect(onChangeState).not.toHaveBeenCalled()

        instance._props = { ...instance.props, loading: true }
        expect(instance.canSave).toBe(false)
        instance._props = null
    })

    it('refreshes validation metadata only when synchronized props actually change, once the commit is in', () => {
        // The props hook runs during the render and the error pass after the commit, which is what
        // `UNSAFE_componentWillReceiveProps` did in one go until §9.3 step 6.
        const { instance, form } = createSetupInstance({
            initialValues: { name: 'before' },
            values: { name: 'after' },
            props: { formProps: { pristine: true } },
        })
        instance._meta = { fields: [] }

        instance.deriveFromProps({
            ...instance.props,
            initialValues: { name: 'before' },
            formProps: { pristine: true },
        })
        instance.componentDidUpdate()
        expect(processErrorsCalls).toHaveLength(0)

        instance.deriveFromProps({
            ...instance.props,
            initialValues: { name: 'next' },
            formProps: { pristine: false },
        })
        expect(processErrorsCalls).toHaveLength(0)
        instance.componentDidUpdate()

        expect(processErrorsCalls).toHaveLength(1)
        expect(processErrorsCalls[0]).toEqual([form, instance._meta])
        expect(instance._props).toBeNull()
    })
})

describe('handleChangeInput is per instance, not per class (§9.3 step 4)', () => {
    let originalRenderField

    beforeAll(() => {
        originalRenderField = Active.renderField
        Active.renderField = () => null
    })
    afterAll(() => { Active.renderField = originalRenderField })
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    /** Two instances of the SAME decorated class — which is the case the shared prototype broke. */
    function twoInstancesOfOneClass () {
        class SharedFormContent extends Component {}
        const SharedFormLayer = withFormSetup(SharedFormContent, { fieldValues, registeredFieldValues, registeredFieldErrors })

        const make = () => {
            const { form } = createFormApi({})
            const instance = new SharedFormLayer({
                initialValues: {},
                formProps: { pristine: true },
                instance: { form, handleSubmit: jest.fn() },
            })
            instance.synced = 0
            // Own property shadows the prototype method, so each instance records only its own calls.
            instance.syncInputChanges = function () { this.synced++ }
            return instance
        }
        return [make(), make()]
    }

    it('does not let one instance cancel the other instance pending change', () => {
        // THE BUG: `debounce()` was called once and assigned to the prototype, so every instance
        // shared a single timer. Two forms typing in the same tick meant the first one's sync was
        // cancelled by the second and never ran — and the survivor ran against the LAST `this`.
        const [a, b] = twoInstancesOfOneClass()

        a.handleChangeInput()
        b.handleChangeInput()
        jest.advanceTimersByTime(1000)

        expect(a.synced).toBe(1)
        expect(b.synced).toBe(1)
    })

    it('gives each instance its own debounced function', () => {
        const [a, b] = twoInstancesOfOneClass()

        expect(typeof a.handleChangeInput).toBe('function')
        expect(a.handleChangeInput).not.toBe(b.handleChangeInput)
    })

    it('still lets an instance be assigned over — a test double or subclass must win', () => {
        // The accessor has a setter for this reason: a getter alone would make assignment throw in
        // strict mode, which is a confusing failure for anyone stubbing the method.
        const [a] = twoInstancesOfOneClass()
        const stub = () => {}

        a.handleChangeInput = stub

        expect(a.handleChangeInput).toBe(stub)
    })

    it('unmounting without ever typing does not create a debounce just to cancel it', () => {
        const [a] = twoInstancesOfOneClass()
        a.props = { ...a.props }

        a.componentWillUnmount()

        // The getter was never touched, so no own property exists — the unmount guard read through
        // hasOwnProperty precisely to avoid instantiating one here.
        expect(Object.prototype.hasOwnProperty.call(a, 'handleChangeInput')).toBe(false)
    })

    it('cancels a pending change when the component unmounts', () => {
        const [a] = twoInstancesOfOneClass()
        a.props = { ...a.props }

        a.handleChangeInput()
        a.componentWillUnmount()
        jest.advanceTimersByTime(1000)

        expect(a.synced).toBe(0)
    })
})
