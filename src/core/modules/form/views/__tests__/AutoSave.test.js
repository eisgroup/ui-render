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

describe('AutoSave debounce lifetime (§9.3 step 4)', () => {
    it('does not save after the component unmounts', async () => {
        // THE HAZARD: AutoSave had no componentWillUnmount at all, so a change typed just before the
        // component went away still fired its onChange afterwards — a write the user had navigated
        // away from, plus a setState on an unmounted component.
        const onChange = jest.fn().mockResolvedValue()
        const { getForm, unmount } = renderFormWithAutoSave({ a: 1 }, { onChange, delay: 300 })

        act(() => { jest.advanceTimersByTime(500) })   // let it capture initial values
        act(() => { getForm().change('a', 2) })         // schedule a save
        unmount()                                       // ...and leave before it fires
        act(() => { jest.advanceTimersByTime(1000) })

        expect(onChange).not.toHaveBeenCalled()
    })

    it('does not fire the OLD debounce after `delay` changes', async () => {
        // The same leak in a second place: UNSAFE_componentWillReceiveProps REPLACED this.handleChange
        // when `delay` changed without cancelling the previous one, so a call scheduled under the old
        // delay still landed.
        const onChange = jest.fn().mockResolvedValue()
        let formApi
        const view = render(
            wrap(
                <Form
                    onSubmit={() => {}}
                    initialValues={{ a: 1 }}
                    render={({ handleSubmit, form }) => {
                        formApi = form
                        return <form onSubmit={handleSubmit}><AutoSave onChange={onChange} delay={300}/></form>
                    }}
                />
            )
        )
        act(() => { jest.advanceTimersByTime(500) })
        act(() => { formApi.change('a', 2) })            // scheduled under delay 300
        view.rerender(
            wrap(
                <Form
                    onSubmit={() => {}}
                    initialValues={{ a: 1 }}
                    render={({ handleSubmit, form }) => {
                        formApi = form
                        return <form onSubmit={handleSubmit}><AutoSave onChange={onChange} delay={5000}/></form>
                    }}
                />
            )
        )
        act(() => { jest.advanceTimersByTime(1000) })    // past the OLD delay, short of the new one

        expect(onChange).not.toHaveBeenCalled()
    })
})
