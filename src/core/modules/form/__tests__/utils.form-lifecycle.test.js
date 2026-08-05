import { Component } from 'react'
import { Form } from 'react-final-form'
import { Active } from '../../../utils'
import { errorsProcessing } from '../../../pages/main/utils'
import { clearErrorsMap, formsStorage } from '../../../pages/main/rules'
import {
    asField,
    fieldValues,
    registeredFieldErrors,
    registeredFieldValues,
    storedTouched,
    withForm,
    withFormSetup,
} from '../utils'

jest.mock('../../../pages/main/rules', () => ({
    clearErrorsMap: jest.fn(),
    formsStorage: new Map(),
}))

jest.mock('../../../pages/main/utils', () => ({
    errorsProcessing: jest.fn(),
}))

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
        Tooltip: ({ children }) => children,
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
        clearErrorsMap.mockClear()
        errorsProcessing.mockClear()
        Object.keys(storedTouched).forEach(key => delete storedTouched[key])
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

        expect(storedTouched).toEqual({ name: true, email: true })
        subscription.listener({ initialValues: nextValues, touched: {} })

        expect(form.mutators.setFieldTouched.mock.calls).toEqual([
            ['name', false],
            ['email', false],
        ])
        expect(storedTouched).toEqual({})
        expect(clearErrorsMap).toHaveBeenCalledTimes(1)
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
            Tooltip: ({ children }) => children,
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
        expect(errorsProcessing).not.toHaveBeenCalled()

        instance.UNSAFE_componentWillReceiveProps({
            ...instance.props,
            initialValues: { name: 'next' },
            formProps: { pristine: false },
        })

        expect(errorsProcessing).toHaveBeenCalledTimes(1)
        expect(errorsProcessing).toHaveBeenCalledWith(form, instance._meta)
        expect(instance._props).toBeNull()
    })
})
