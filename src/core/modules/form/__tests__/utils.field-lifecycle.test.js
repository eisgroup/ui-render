import React, { Component } from 'react'
import { act, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import {
    asField,
    fieldValues,
    registeredFieldErrors,
    registeredFieldValues,
    withFormSetup,
} from '../utils'
import { Active } from '../../../utils'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'

const BareInput = ({ value }) => (
    <input data-testid="field" value={value || ''} readOnly />
)

const ContractTooltip = ({ children }) => (
    <aside data-testid="validation-tooltip">{children}</aside>
)

function makeContractForm ({ values = {}, registered = [], fieldStates = {} } = {}) {
    return {
        change: jest.fn(),
        getState: jest.fn(() => ({ values })),
        getRegisteredFields: jest.fn(() => registered),
        getFieldState: jest.fn(name => ({ name, ...(fieldStates[name] || {}) })),
    }
}

function makeDecoratedInstance ({
    values = {},
    initialValues = {},
    registered = [],
    fieldStates = {},
    props = {},
    handleChangeInput,
    componentWillReceiveProps,
    componentWillUnmount,
} = {}) {
    class FormHarness extends Component {}

    if (handleChangeInput) FormHarness.prototype.handleChangeInput = handleChangeInput
    if (componentWillReceiveProps) {
        FormHarness.prototype.UNSAFE_componentWillReceiveProps = componentWillReceiveProps
    }
    if (componentWillUnmount) FormHarness.prototype.componentWillUnmount = componentWillUnmount

    withFormSetup(FormHarness, {
        fieldValues,
        registeredFieldValues,
        registeredFieldErrors,
        Tooltip: ContractTooltip,
    })

    const form = makeContractForm({ values, registered, fieldStates })
    const owner = { form, handleSubmit: jest.fn() }
    const instance = new FormHarness({
        initialValues,
        formProps: { pristine: true },
        instance: owner,
        ...props,
    })
    instance.state = { ...FormHarness.prototype.state }
    instance.setState = jest.fn(update => {
        const next = typeof update === 'function' ? update(instance.state, instance.props) : update
        instance.state = { ...instance.state, ...next }
    })

    return { instance, form, owner }
}

describe('asField lifecycle contracts', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    it('clears a removed field after unmount and notifies the owning UI instance', () => {
        const initialValues = { attachment: 'old.csv' }
        const owner = {
            form: { change: jest.fn() },
            isUnmounting: false,
            props: { initialValues },
        }
        const onChange = jest.fn()
        const RemovableField = asField(BareInput)
        const view = render(
            <Form
                onSubmit={() => {}}
                initialValues={initialValues}
                render={() => (
                    <RemovableField
                        name="attachment"
                        instance={owner}
                        onRemoveChange
                        onChange={onChange}
                    />
                )}
            />
        )

        view.unmount()
        act(() => jest.runOnlyPendingTimers())

        expect(owner.form.change).toHaveBeenCalledWith('attachment', null)
        expect(onChange).toHaveBeenCalledWith(null)
    })

    it('does not mutate a form that is itself unmounting', () => {
        const initialValues = { attachment: 'old.csv' }
        const owner = {
            form: { change: jest.fn() },
            isUnmounting: false,
            props: { initialValues },
        }
        const onChange = jest.fn()
        const RemovableField = asField(BareInput)
        const view = render(
            <Form
                onSubmit={() => {}}
                initialValues={initialValues}
                render={() => (
                    <RemovableField
                        name="attachment"
                        instance={owner}
                        onRemoveChange
                        onChange={onChange}
                    />
                )}
            />
        )

        owner.isUnmounting = true
        view.unmount()
        act(() => jest.runOnlyPendingTimers())

        expect(owner.form.change).not.toHaveBeenCalled()
        expect(onChange).not.toHaveBeenCalled()
    })

    it('does not clear a replacement form after initialValues change', () => {
        const initialValues = { attachment: 'old.csv' }
        const owner = {
            form: { change: jest.fn() },
            isUnmounting: false,
            props: { initialValues },
        }
        const onChange = jest.fn()
        const RemovableField = asField(BareInput)
        const view = render(
            <Form
                onSubmit={() => {}}
                initialValues={initialValues}
                render={() => (
                    <RemovableField
                        name="attachment"
                        instance={owner}
                        onRemoveChange
                        onChange={onChange}
                    />
                )}
            />
        )

        owner.props = { initialValues: { attachment: 'replacement.csv' } }
        view.unmount()
        act(() => jest.runOnlyPendingTimers())

        expect(owner.form.change).not.toHaveBeenCalled()
        expect(onChange).not.toHaveBeenCalled()
    })

    it('resets Dropdown previous-value state when an empty value normalizes to undefined', () => {
        const Dropdown = () => null
        Dropdown.displayName = 'Dropdown'
        const DropdownField = asField(Dropdown)
        const field = new DropdownField({ name: 'selection' })
        field.setState = update => {
            field.state = { ...field.state, ...update }
        }
        const input = {
            name: 'selection',
            onBlur: jest.fn(),
            onChange: jest.fn(),
            onFocus: jest.fn(),
        }

        field.Input({ input: { ...input, value: 'stable' }, meta: { pristine: true } })
        expect(field.state.selectPreviousValue).toBe('stable')

        const normalized = field.Input({
            input: { ...input, value: '' },
            meta: { pristine: false },
        })

        expect(normalized.props.value).toBeUndefined()
        expect(field.state.selectPreviousValue).toBeNull()
    })
})

describe('withFormSetup public instance contracts', () => {
    let originalRenderField

    beforeAll(() => {
        originalRenderField = Active.renderField
        if (!Active.renderField) Active.renderField = () => null
    })

    afterAll(() => {
        Active.renderField = originalRenderField
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    it('fails fast when the field renderer registry has not been initialized', () => {
        const registeredRenderField = Active.renderField
        class FormHarness extends Component {}

        try {
            Active.renderField = null
            expect(() => withFormSetup(FormHarness, {
                fieldValues,
                registeredFieldValues,
                registeredFieldErrors,
            })).toThrow('requires Active.renderField to be registered')
        } finally {
            Active.renderField = registeredRenderField
        }
    })

    it('combines registered values with changes and omits an empty result', () => {
        const populated = makeDecoratedInstance({
            initialValues: { changed: 'before', stable: 'same' },
            values: { changed: 'after', stable: 'same', added: 'new' },
            registered: ['changed', 'registeredOnly'],
            fieldStates: {
                changed: { value: 'after' },
                registeredOnly: { value: 'kept' },
            },
        }).instance

        expect(populated.changedAndRegisteredValues).toEqual({
            changed: 'after',
            registeredOnly: 'kept',
            added: 'new',
        })

        const empty = makeDecoratedInstance({ initialValues: {}, values: {} }).instance
        expect(empty.changedAndRegisteredValues).toBeUndefined()
    })

    it('builds validation content using group label, field label, and field-name fallbacks', () => {
        const { instance } = makeDecoratedInstance({
            registered: ['email', 'policy.number', 'plain'],
            fieldStates: {
                email: { error: 'Required' },
                'policy.number': { error: { code: 'invalid' } },
                plain: { error: 'Incorrect' },
            },
        })
        instance._fields = [
            { name: 'email', label: 'Email address' },
            { name: 'policy.number', label: 'Policy number', labelGroup: 'Policy' },
        ]

        const { container } = render(
            <ConfigContext.Provider value={initialConfigState}>
                {instance.validationErrorsTooltip}
            </ConfigContext.Provider>
        )

        expect(container.querySelector('.tooltip')).toBeInTheDocument()
        expect(screen.getByText('• Email address: Required')).toBeInTheDocument()
        expect(screen.getByText('• Policy: {"code":"invalid"}')).toBeInTheDocument()
        expect(screen.getByText('• plain: Incorrect')).toBeInTheDocument()
    })

    it('returns no validation UI when registered fields have no errors', () => {
        const { instance } = makeDecoratedInstance({
            registered: ['email'],
            fieldStates: { email: { value: 'valid@example.com' } },
        })

        expect(instance.validationErrors).toBeNull()
        expect(instance.validationErrorsTooltip).toBeNull()
    })

    it('debounces input synchronization and publishes the new canSave state', () => {
        jest.useFakeTimers()
        const originalHandleChangeInput = jest.fn()
        const onDataChanged = jest.fn()
        const onChangeState = jest.fn()
        const { instance } = makeDecoratedInstance({
            initialValues: { name: 'before' },
            values: { name: 'after' },
            registered: ['name'],
            fieldStates: { name: { value: 'after' } },
            props: {
                formProps: { pristine: false },
                onDataChanged,
                onChangeState,
            },
            handleChangeInput: originalHandleChangeInput,
        })

        instance.handleChangeInput('typed')
        expect(onDataChanged).not.toHaveBeenCalled()

        act(() => jest.runOnlyPendingTimers())

        expect(onDataChanged).toHaveBeenCalledTimes(1)
        expect(instance.state.canSave).toBe(true)
        expect(onChangeState).toHaveBeenCalledWith(instance)
        expect(originalHandleChangeInput).toHaveBeenCalledWith('typed')
    })

    it('falls back to the parent data-change callback', () => {
        const parent = { onDataChanged: jest.fn() }
        const { instance } = makeDecoratedInstance({
            initialValues: { name: 'before' },
            values: { name: 'after' },
            props: {
                formProps: { pristine: false },
                parent,
            },
        })

        instance.syncInputChanges()

        expect(parent.onDataChanged).toHaveBeenCalledTimes(1)
    })

    it('recomputes against incoming props, refreshes meta errors, and preserves the original lifecycle', () => {
        const originalLifecycle = jest.fn()
        const { instance, form } = makeDecoratedInstance({
            initialValues: { name: 'before' },
            values: { name: 'after' },
            registered: [],
            props: { formProps: { pristine: true } },
            componentWillReceiveProps: originalLifecycle,
        })
        instance._meta = {}
        const nextProps = {
            ...instance.props,
            initialValues: { name: 'next baseline' },
            formProps: { pristine: false },
        }

        instance.UNSAFE_componentWillReceiveProps(nextProps, 'next-context')

        expect(instance._props).toBeNull()
        expect(instance.state.canSave).toBe(true)
        expect(form.getRegisteredFields).toHaveBeenCalledTimes(2)
        expect(originalLifecycle).toHaveBeenCalledWith(nextProps, 'next-context')
    })

    it('marks the form as unmounting and clears the published instance', () => {
        const originalLifecycle = jest.fn()
        const onChangeState = jest.fn()
        const { instance } = makeDecoratedInstance({
            props: { onChangeState },
            componentWillUnmount: originalLifecycle,
        })

        instance.componentWillUnmount()

        expect(instance.isUnmounting).toBe(true)
        expect(onChangeState).toHaveBeenCalledWith({})
        expect(originalLifecycle).toHaveBeenCalledTimes(1)
    })
})
