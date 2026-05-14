import React from 'react'
import { render, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import AutoSave from '../AutoSave'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

const renderFormWithAutoSave = (initialValues = {}, autoSaveProps = {}, onSubmit = () => {}) => {
    let formApi
    const onChange = autoSaveProps.onChange || jest.fn()
    const utils = render(
        wrap(
            <Form
                onSubmit={onSubmit}
                initialValues={initialValues}
                render={({ handleSubmit, form }) => {
                    formApi = form
                    return (
                        <form onSubmit={handleSubmit}>
                            <AutoSave {...autoSaveProps} onChange={onChange} />
                        </form>
                    )
                }}
            />
        )
    )
    return { ...utils, getForm: () => formApi, onChange }
}

describe('AutoSave', () => {
    it('captures the initial values on mount without calling onChange', () => {
        const onChange = jest.fn()
        renderFormWithAutoSave({ a: 1 }, { onChange })
        act(() => {
            jest.advanceTimersByTime(500)
        })
        expect(onChange).not.toHaveBeenCalled()
    })

    it('calls onChange with full values when a value changes (debounced)', async () => {
        const onChange = jest.fn().mockResolvedValue()
        const { getForm } = renderFormWithAutoSave({ a: 1 }, { onChange, delay: 100 })
        // Mount tick — capture initial
        act(() => {
            jest.advanceTimersByTime(100)
        })
        act(() => {
            getForm().change('a', 2)
        })
        act(() => {
            jest.advanceTimersByTime(100)
        })
        await Promise.resolve()
        expect(onChange).toHaveBeenCalled()
        expect(onChange.mock.calls[0][0]).toEqual({ a: 2 })
    })

    it('calls onChange with only changed values when partial=true', async () => {
        const onChange = jest.fn().mockResolvedValue()
        const { getForm } = renderFormWithAutoSave(
            { a: 1, b: 2 },
            { onChange, partial: true, delay: 100 }
        )
        act(() => {
            jest.advanceTimersByTime(100)
        })
        act(() => {
            getForm().change('b', 5)
        })
        act(() => {
            jest.advanceTimersByTime(100)
        })
        await Promise.resolve()
        expect(onChange.mock.calls[0][0]).toEqual({ b: 5 })
    })

    it('renders nothing when showLoader is not set', () => {
        const { container } = renderFormWithAutoSave({ a: 1 })
        expect(container.querySelector('.app__loading')).not.toBeInTheDocument()
    })

    it('does not call onChange when values do not change', async () => {
        const onChange = jest.fn().mockResolvedValue()
        const { getForm } = renderFormWithAutoSave({ a: 1 }, { onChange, delay: 100 })
        act(() => {
            jest.advanceTimersByTime(100)
        })
        act(() => {
            getForm().change('a', 1)
        })
        act(() => {
            jest.advanceTimersByTime(100)
        })
        await Promise.resolve()
        expect(onChange).not.toHaveBeenCalled()
    })

    it('does not crash with showLoader=true and submitting=false', () => {
        const { container } = renderFormWithAutoSave({ a: 1 }, { showLoader: true })
        expect(container.firstChild).toBeInTheDocument()
    })
})
