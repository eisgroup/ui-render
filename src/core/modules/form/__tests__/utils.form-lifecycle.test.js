import { Component } from 'react'
import { Form } from 'react-final-form'
import { Active } from '../../../utils'
import { errorsFor, formsStorage, touchedFor } from '../../../state/formRegistry'
import {
    asField,
    fieldValues,
    registeredFieldErrors,
    registeredFieldValues,
    withForm,
    withFormSetup,
} from '../utils'

// NOT mocked. It used to be, to spy on a `clearErrorsMap` that cleared one shared object; the mock
// then had to be kept in step with the real module through two conversions and fell behind twice.
// Since §9.3 step 3 both registries are keyed by the form, so the real module can simply be asked
// what a given form holds — which is also what the code under test does.

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

function createWithFormInstance ({ initialValues = {}, meta = {}, options, props = {} } = {}) {
    class FormContent extends Component {
        render () {
            return null
        }
    }

    const Decorated = options === undefined
        ? withForm()(FormContent)
        : withForm(options)(FormContent)
    const componentProps = {
        initialValues,
        meta,
        onSubmit: jest.fn(),
        ...props,
    }
    const instance = new Decorated(componentProps)

    return { Decorated, FormContent, componentProps, instance }
}

function createSetupInstance ({
    initialValues = {},
    values = {},
    registered = [],
    fieldStates = {},
    props = {},
} = {}) {
    class FormContent extends Component {}

    withFormSetup(FormContent, {
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
    const instance = new FormContent(componentProps)
    instance.state = { ...FormContent.prototype.state }
    instance.setState = jest.fn(update => {
        const next = typeof update === 'function' ? update(instance.state, instance.props) : update
        instance.state = { ...instance.state, ...next }
    })

    return { form, instance, owner }
}

describe('withForm subscription and lifecycle contracts', () => {
    let originalRenderField

    beforeAll(() => {
        originalRenderField = Active.renderField
        Active.renderField = Active.renderField || (() => null)
    })

    afterAll(() => {
        Active.renderField = originalRenderField
    })

    beforeEach(() => {
        formsStorage.clear()
        processErrorsCalls.length = 0
    })

    it('does not let a second form reset the first one when it initialises', () => {
        // THE DEFECT THIS SLICE FIXED, and the only one of its family with a demonstrable symptom.
        // `storedTouched` and the baseline it was compared against were both module-level, so the
        // FIRST form to arrive owned the comparison for every form after it: a second document
        // mounting with its own `initialValues` looked like a re-initialisation and wiped the first
        // document's touched fields and errors. Sharing the registry itself produced nothing
        // observable — four scenarios were probed — but this did.
        const firstValues = { name: 'first' }
        const secondValues = { other: 'second' }

        const { instance: first } = createWithFormInstance({ initialValues: firstValues })
        const { form: formA, listeners: listenersA } = createFormApi()
        first.renderForm({ form: formA, handleSubmit: jest.fn(), pristine: true })
        listenersA[0].listener({ initialValues: firstValues, touched: { name: true } })
        errorsFor(formA).name = 'Name is Required'

        expect(touchedFor(formA)).toEqual({ name: true })

        // A second document appears, with a baseline of its own.
        const { instance: second } = createWithFormInstance({ initialValues: secondValues })
        const { form: formB, listeners: listenersB } = createFormApi()
        second.renderForm({ form: formB, handleSubmit: jest.fn(), pristine: true })
        listenersB[0].listener({ initialValues: secondValues, touched: {} })

        expect(touchedFor(formA)).toEqual({ name: true })
        expect(errorsFor(formA)).toEqual({ name: 'Name is Required' })
        expect(formA.mutators.setFieldTouched).not.toHaveBeenCalled()
    })

    it('tracks touched fields and clears them when a new non-empty baseline arrives', () => {
        const firstValues = { name: 'first' }
        const nextValues = { name: 'next' }
        const { instance } = createWithFormInstance({ initialValues: firstValues })
        const { form, listeners } = createFormApi()

        instance.renderForm({ form, handleSubmit: jest.fn(), pristine: true })
        const subscription = listeners[0]
        subscription.listener({ initialValues: firstValues, touched: { name: true, ignored: false } })
        subscription.listener({ initialValues: firstValues, touched: { email: true } })

        expect(touchedFor(form)).toEqual({ name: true, email: true })
        errorsFor(form).name = 'stale'
        subscription.listener({ initialValues: nextValues, touched: {} })

        expect(form.mutators.setFieldTouched.mock.calls).toEqual([
            ['name', false],
            ['email', false],
        ])
        // Cleared for THIS form, not for everybody: that is the whole of the step 3 change here.
        expect(touchedFor(form)).toEqual({})
        expect(errorsFor(form)).toEqual({})
        expect(subscription.subscription).toEqual({
            touched: true,
            initialValues: true,
            error: true,
            errors: true,
        })
    })

    it('keeps one subscription per form and disposes it when the form API changes', () => {
        const { instance } = createWithFormInstance({ initialValues: { name: 'first' } })
        const first = createFormApi()
        const second = createFormApi()
        const handleSubmit = jest.fn()

        const firstRender = instance.renderForm({
            form: first.form,
            handleSubmit,
            pristine: true,
            valid: true,
        })
        const cachedFormProps = firstRender.props.formProps
        const repeatedRender = instance.renderForm({
            form: first.form,
            handleSubmit,
            pristine: true,
            valid: true,
        })

        expect(first.form.subscribe).toHaveBeenCalledTimes(1)
        expect(repeatedRender.props.formProps).toBe(cachedFormProps)

        instance.renderForm({ form: second.form, handleSubmit, pristine: false, valid: true })

        expect(first.unsubscribe).toHaveBeenCalledTimes(1)
        expect(second.form.subscribe).toHaveBeenCalledTimes(1)
        expect(instance.form).toBe(second.form)
        expect(instance.handleSubmit).toBe(handleSubmit)
    })

    it('unsubscribes and removes the mounted form from storage on unmount', () => {
        const initialValues = { id: 7 }
        const meta = { view: 'Form' }
        const { instance } = createWithFormInstance({ initialValues, meta })
        const { form, unsubscribe } = createFormApi()

        instance.renderForm({ form, handleSubmit: jest.fn(), pristine: true })
        instance.componentDidMount()
        const storageKey = instance.prevInitialValues

        expect(formsStorage.get(storageKey)).toEqual({ meta, form })
        instance.componentWillUnmount()

        expect(unsubscribe).toHaveBeenCalledTimes(1)
        expect(formsStorage.has(storageKey)).toBe(false)
    })

    it('resets and re-registers only genuinely changed initial values', () => {
        const initialValues = { customer: { id: 1 } }
        const { instance, componentProps } = createWithFormInstance({
            initialValues,
            meta: { version: 1 },
        })
        const { form } = createFormApi()
        instance.form = form
        instance._initValues = initialValues
        instance.componentDidMount()
        const originalStorageKey = instance.prevInitialValues

        const equalValues = { customer: { id: 1 } }
        instance.UNSAFE_componentWillReceiveProps({
            ...componentProps,
            initialValues: equalValues,
            meta: { version: 2 },
        })
        expect(form.reset).not.toHaveBeenCalled()
        expect(formsStorage.has(originalStorageKey)).toBe(true)

        const changedValues = { customer: { id: 2 } }
        const changedMeta = { version: 3 }
        instance.UNSAFE_componentWillReceiveProps({
            ...componentProps,
            initialValues: changedValues,
            meta: changedMeta,
        })

        expect(form.reset).toHaveBeenCalledWith(changedValues)
        expect(formsStorage.has(originalStorageKey)).toBe(false)
        expect(formsStorage.get(instance.prevInitialValues)).toEqual({ meta: changedMeta, form })
    })

    it('exposes default Form options and safely ignores a touched mutator for a missing field', () => {
        const initialValues = { name: 'initial' }
        const onSubmit = jest.fn()
        const { instance } = createWithFormInstance({ initialValues, props: { onSubmit } })

        const formElement = instance.render()
        const touchedField = { touched: false }
        const state = { fields: { name: touchedField } }

        expect(formElement.type).toBe(Form)
        expect(formElement.props.subscription).toEqual({ pristine: true, valid: true })
        expect(formElement.props.initialValues).toBe(initialValues)
        expect(formElement.props.onSubmit).toBe(onSubmit)
        expect(formElement.props.mutators.remove).toEqual(expect.any(Function))

        formElement.props.mutators.setFieldTouched(['name', true], state)
        expect(touchedField.touched).toBe(true)
        expect(() => formElement.props.mutators.setFieldTouched(['missing', true], state)).not.toThrow()
    })
})

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
        withFormSetup(NestedFormContent, {
            fieldValues,
            registeredFieldValues,
            registeredFieldErrors,
        })
        const parent = { form: createFormApi().form, handleSubmit: jest.fn() }
        const instance = new NestedFormContent({
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

    it('refreshes validation metadata only when synchronized props actually change', () => {
        const { instance, form } = createSetupInstance({
            initialValues: { name: 'before' },
            values: { name: 'after' },
            props: { formProps: { pristine: true } },
        })
        instance._meta = { fields: [] }

        instance.UNSAFE_componentWillReceiveProps({
            ...instance.props,
            initialValues: { name: 'before' },
            formProps: { pristine: true },
        })
        expect(processErrorsCalls).toHaveLength(0)

        instance.UNSAFE_componentWillReceiveProps({
            ...instance.props,
            initialValues: { name: 'next' },
            formProps: { pristine: false },
        })

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
        withFormSetup(SharedFormContent, { fieldValues, registeredFieldValues, registeredFieldErrors })

        const make = () => {
            const { form } = createFormApi({})
            const instance = new SharedFormContent({
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
