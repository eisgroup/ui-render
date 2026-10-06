// fetch is referenced while rules.tsx initializes FIELD.FUNC.
if (typeof global.fetch === 'undefined') {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}

import React from 'react' // eslint-disable-line import/first
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
// Load the form module before rules.tsx enters the mapper -> renders.tsx cycle.
import UIRender, { formsStorage } from '../rules' // eslint-disable-line import/first
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts' // eslint-disable-line import/first

const appContext = {
    ...initialAppState,
    setPopupState: jest.fn(),
}

const withProviders = (ui, config = initialConfigState) => (
    <ConfigContext.Provider value={config}>
        <AppContext.Provider value={appContext}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

const formMeta = (...items) => ({
    view: 'Row',
    items,
})

afterEach(() => {
    cleanup()
    formsStorage.clear()
    appContext.setPopupState.mockClear()
})

describe('UIRender public form contracts', () => {
    it('submits the exact current payload after a user changes an Input', async () => {
        const onSubmit = jest.fn()
        const initialValues = {
            customer: {
                name: 'Alice',
                reference: 'C-001',
            },
            requestId: 'request-7',
        }
        const meta = formMeta(
            { view: 'Input', name: 'customer.name', label: 'Customer name' },
            { view: 'Input', name: 'customer.reference', label: 'Reference' },
            { view: 'Button', children: 'Save', onClick: 'submit' },
        )

        render(withProviders(
            <UIRender
                form
                meta={meta}
                data={initialValues}
                initialValues={initialValues}
                onSubmit={onSubmit}
                getValidationErrors={() => {}}
            />
        ))

        const nameInput = screen.getByLabelText('Customer name')
        fireEvent.focus(nameInput)
        fireEvent.change(nameInput, { target: { value: 'Bob' } })
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0][0]).toEqual({
            customer: {
                name: 'Bob',
                reference: 'C-001',
            },
            requestId: 'request-7',
        })
    })

    it('reports touched validation errors and prevents invalid submission', async () => {
        const onSubmit = jest.fn()
        const getValidationErrors = jest.fn()
        const initialValues = {
            profile: {
                firstName: '',
            },
            requestId: 'request-8',
        }
        const meta = formMeta(
            {
                view: 'Input',
                name: 'profile.firstName',
                label: 'First name',
                validate: 'required',
                required: true,
            },
            { view: 'Button', children: 'Continue', onClick: 'submit' },
        )

        render(withProviders(
            <UIRender
                form
                meta={meta}
                data={initialValues}
                initialValues={initialValues}
                onSubmit={onSubmit}
                getValidationErrors={getValidationErrors}
            />
        ))

        const input = screen.getByLabelText('First name')
        fireEvent.focus(input)
        fireEvent.blur(input)

        const expectedErrors = {
            'profile.firstName': {
                messages: [
                    { text: 'First Name is Required' },
                ],
            },
        }
        await waitFor(() => expect(getValidationErrors).toHaveBeenCalledWith(expectedErrors))
        expect(screen.getByText('Required')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
        expect(onSubmit).not.toHaveBeenCalled()

        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'Ada' } })
        fireEvent.blur(input)

        await waitFor(() => {
            expect(getValidationErrors.mock.calls[getValidationErrors.mock.calls.length - 1][0]).toEqual({})
        })
        expect(screen.queryByText('Required')).not.toBeInTheDocument()
    })

    it('re-evaluates showIf from live form values after an Input changes', async () => {
        const initialValues = {
            mode: 'basic',
            requestId: 'request-9',
        }
        const meta = formMeta(
            { view: 'Input', name: 'mode', label: 'Mode' },
            {
                view: 'Text',
                children: 'Advanced settings',
                showIf: {
                    name: 'mode',
                    equal: 'advanced',
                },
            },
        )

        render(withProviders(
            <UIRender
                form
                meta={meta}
                data={initialValues}
                initialValues={initialValues}
                getValidationErrors={() => {}}
            />
        ))

        expect(screen.queryByText('Advanced settings')).not.toBeInTheDocument()

        const modeInput = screen.getByLabelText('Mode')
        fireEvent.focus(modeInput)
        fireEvent.change(modeInput, { target: { value: 'advanced' } })

        await waitFor(() => expect(screen.getByText('Advanced settings')).toBeInTheDocument())

        fireEvent.change(modeInput, { target: { value: 'basic' } })
        await waitFor(() => expect(screen.queryByText('Advanced settings')).not.toBeInTheDocument())
    })

    it('reinitializes the visible Input and getFormData when data props change', async () => {
        const getFormData = jest.fn()
        const meta = formMeta(
            { view: 'Input', name: 'profile.name', label: 'Profile name' },
        )
        const firstValues = {
            profile: { name: 'Alice' },
            revision: 1,
        }
        const secondValues = {
            profile: { name: 'Grace' },
            revision: 2,
        }
        const commonProps = {
            form: true,
            meta,
            getFormData,
            getValidationErrors: () => {},
        }
        const { rerender } = render(withProviders(
            <UIRender
                {...commonProps}
                data={firstValues}
                initialValues={firstValues}
            />
        ))

        expect(getFormData).toHaveBeenCalledTimes(1)
        const readFormData = getFormData.mock.calls[0][0]
        expect(readFormData()).toEqual(firstValues)

        const input = screen.getByLabelText('Profile name')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'Locally edited' } })
        await waitFor(() => {
            expect(readFormData()).toEqual({
                profile: { name: 'Locally edited' },
                revision: 1,
            })
        })
        fireEvent.blur(input)

        rerender(withProviders(
            <UIRender
                {...commonProps}
                data={secondValues}
                initialValues={secondValues}
            />
        ))

        await waitFor(() => expect(screen.getByLabelText('Profile name')).toHaveValue('Grace'))
        expect(readFormData()).toEqual(secondValues)
    })

    it('normalizes ISO data from new props for rendering and refreshes getFormData', async () => {
        const getFormData = jest.fn()
        const meta = formMeta(
            { view: 'Text', name: 'effectiveAt' },
            { view: 'Input', name: 'revision', label: 'Revision' },
        )
        const firstValues = {
            effectiveAt: '2025-01-02T03:04:05.000Z',
            revision: 'old',
        }
        const secondValues = {
            effectiveAt: '2026-07-31T23:59:58.000Z',
            revision: 'new',
        }
        const config = {
            ...initialConfigState,
            dateFormat: 'YYYY-MM-DD',
        }
        const commonProps = {
            form: true,
            meta,
            getFormData,
            getValidationErrors: () => {},
        }
        const { rerender } = render(withProviders(
            <UIRender
                {...commonProps}
                data={firstValues}
                initialValues={firstValues}
            />,
            config
        ))

        const readFormData = getFormData.mock.calls[0][0]
        expect(screen.getByText('2025-01-02')).toBeInTheDocument()
        expect(readFormData()).toEqual(firstValues)

        rerender(withProviders(
            <UIRender
                {...commonProps}
                data={secondValues}
                initialValues={secondValues}
            />,
            config
        ))

        await waitFor(() => {
            expect(screen.getByText('2026-07-31')).toBeInTheDocument()
            expect(screen.getByLabelText('Revision')).toHaveValue('new')
            expect(readFormData()).toEqual(secondValues)
        })
        expect(screen.queryByText(secondValues.effectiveAt)).not.toBeInTheDocument()
    })

    it('keeps the error of a field the user touched when its tab is switched away and back', async () => {
        // final-form forgets a field's `touched` when the field unmounts, which is what a tab switch does,
        // and the form is still pristine, so only the remembered touch can show the error again. It was
        // forgotten too while that registry was keyed by react-final-form's per-render form object.
        const meta = {
            view: 'Tabs',
            items: [
                { tab: 'One', content: { view: 'Input', name: 'first', label: 'First', validate: 'required', required: true } },
                { tab: 'Two', content: { view: 'Text', label: 'Second tab' } },
            ],
        }
        const values = { first: '' }
        render(withProviders(<UIRender form meta={meta} data={values} initialValues={values} onSubmit={() => {}} />))

        const input = screen.getByLabelText('First')
        fireEvent.focus(input)
        fireEvent.blur(input)
        await waitFor(() => expect(screen.getByText('Required')).toBeInTheDocument())

        // A tab switch waits out the tabs' 50 ms transition, inside act: React 16 and 17 warned about the
        // update its timer makes when it fired after a window closed.
        const switchTo = label => act(async () => {
            fireEvent.click(screen.getByText(label))
            await new Promise(resolve => setTimeout(resolve, 100))
        })
        await switchTo('Two')
        expect(screen.getByText('Second tab')).toBeInTheDocument()
        await switchTo('One')

        expect(screen.getByLabelText('First')).toBeInTheDocument()
        expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('validates `validate: \'maxLength\'` as at most 100 characters, rather than failing every value', async () => {
        // `FIELD.VALIDATION.maxLength` was the FACTORY, so the field's validator returned a function, an
        // error, for every value: the form could never be submitted.
        const submitted = []
        const meta = formMeta(
            { view: 'Input', name: 'note', label: 'Note', validate: 'maxLength' },
            { view: 'Button', children: 'Send', onClick: 'submit' },
        )
        const values = { note: '' }
        render(withProviders(<UIRender form meta={meta} data={values} initialValues={values} onSubmit={(data) => { submitted.push(data) }} />))

        const input = screen.getByLabelText('Note')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'x'.repeat(101) } })
        fireEvent.blur(input)
        await waitFor(() => expect(screen.getByText('Must be less than 100 characters')).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button', { name: 'Send' }))
        expect(submitted).toHaveLength(0)

        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'short enough' } })
        fireEvent.blur(input)
        await waitFor(() => expect(screen.queryByText('Must be less than 100 characters')).not.toBeInTheDocument())
        fireEvent.click(screen.getByRole('button', { name: 'Send' }))
        await waitFor(() => expect(submitted).toHaveLength(1))
        expect(submitted[0]).toEqual(expect.objectContaining({ note: 'short enough' }))
    })

    it('renders an empty field with `format: \'uppercase\'`, and shows what was typed in capitals', async () => {
        // final-form formats an empty field's `undefined`, and `uppercase` called `toUpperCase` on it:
        // the field's render threw, so an empty field with this format never rendered.
        const meta = formMeta({ view: 'Input', name: 'code', label: 'Code', format: 'uppercase' })
        render(withProviders(<UIRender form meta={meta} data={{}} initialValues={{}} onSubmit={() => {}} />))

        const input = screen.getByLabelText('Code')
        expect(input).toHaveValue('')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'ab-1' } })
        fireEvent.blur(input)
        await waitFor(() => expect(screen.getByLabelText('Code')).toHaveValue('AB-1'))
    })
})
