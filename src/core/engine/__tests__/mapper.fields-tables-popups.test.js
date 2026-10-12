import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../modules/form/utils'
import Render from '..'
import { FIELD } from '../../modules/variables'
import { OK } from '../../components/inputs/validationRules'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'
import { renderField } from '../components/renders'
import TableView from '../components/TableView'
import '../mapper'

jest.mock('../components/renders', () => {
    const { Active } = jest.requireActual('../../utils')
    const mockedRenderField = jest.fn(() => null)
    Active.renderField = mockedRenderField
    return {
        __esModule: true,
        renderField: mockedRenderField,
    }
})

jest.mock('../components/TableView', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}))

const withProviders = ui => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={initialAppState}>
            {ui}
        </AppContext.Provider>
    </ConfigContext.Provider>
)

const baseInstance = () => ({
    state: {},
    submit: jest.fn(),
})

const renderMapped = (props = {}) => {
    const instance = props.instance || baseInstance()
    const form = props.form || { change: jest.fn() }
    const result = render(withProviders(
        <Render.Component
            view={FIELD.TYPE.TEXT}
            items={[]}
            data={{}}
            instance={instance}
            form={form}
            {...props}
        />
    ))
    return { ...result, form, instance }
}

const lastFieldProps = () => renderField.mock.calls[renderField.mock.calls.length - 1][0]
const lastTableProps = () => TableView.mock.calls[TableView.mock.calls.length - 1][0]

describe('mapper behavior contracts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test.each([
        ['select', FIELD.TYPE.SELECT],
        ['slider', FIELD.TYPE.SLIDER],
        ['toggle', FIELD.TYPE.TOGGLE],
        ['file', FIELD.TYPE.UPLOAD],
    ])('maps generic Input type %s to its field view', (type, expectedView) => {
        renderMapped({
            view: FIELD.TYPE.INPUT,
            name: 'value',
            type,
        })

        expect(lastFieldProps().view).toBe(expectedView)
        if (type === 'file') {
            expect(lastFieldProps().className).toContain('input--wrapper')
        }
    })

    it('builds a relative field name and maps stable Select values back to indices', () => {
        const onChange = jest.fn()
        renderMapped({
            view: FIELD.TYPE.SELECT,
            name: 'status',
            relativePath: 'dataKind.rows',
            relativeIndex: 2,
            options: [
                { id: 'draft', label: 'Draft' },
                { id: 'bound', label: 'Bound' },
            ],
            mapOptions: { text: 'label', value: 'id' },
            onChange,
        })

        const field = lastFieldProps()
        expect(field.name).toBe('dataKind.rows[2].status')
        expect(field.id).toBe('dataKind.rows[2].status')
        expect(field.options).toEqual([
            { text: 'Draft', value: 'draft' },
            { text: 'Bound', value: 'bound' },
        ])

        field.onChange('bound')
        field.onChange('unknown')
        expect(onChange).toHaveBeenNthCalledWith(1, '1')
        expect(onChange).toHaveBeenNthCalledWith(2, 'unknown')
    })

    it('coordinates removable fields with form clearing and debounced auto-submit', () => {
        jest.useFakeTimers()
        const onChange = jest.fn()
        const onRemove = jest.fn()
        const onClickIcon = jest.fn()
        const form = { change: jest.fn() }
        const instance = baseInstance()

        renderMapped({
            view: FIELD.TYPE.INPUT,
            name: 'comment',
            removable: true,
            autoSubmit: { delay: 0 },
            onChange,
            onRemove,
            onClickIcon,
            form,
            instance,
        })

        const field = lastFieldProps()
        field.onChange('changed')
        jest.runOnlyPendingTimers()
        expect(onChange).toHaveBeenCalledWith('changed')
        expect(instance.submit).toHaveBeenCalledTimes(1)

        field.onClickIcon('icon-event')
        jest.runOnlyPendingTimers()
        expect(form.change).toHaveBeenCalledWith('comment', null)
        expect(onRemove).toHaveBeenCalledWith('comment')
        expect(onChange).toHaveBeenCalledWith(null)
        expect(onClickIcon).toHaveBeenCalledWith('icon-event')
        expect(instance.submit).toHaveBeenCalledTimes(2)
    })

    it('debounces auto-submit across renders, not within a single render pass', () => {
        // The mapper runs on every render, so building the debounced submit inline gave each pass
        // its own timer: two changes with a render between them used to submit twice, which is the
        // opposite of what a debounce is for.
        jest.useFakeTimers()
        const instance = baseInstance()
        const element = label => withProviders(
            <Render.Component
                view={FIELD.TYPE.INPUT}
                name="comment"
                label={label}
                autoSubmit={{ delay: 300 }}
                items={[]}
                data={{}}
                instance={instance}
                form={{ change: jest.fn() }}
            />
        )

        const { rerender } = render(element('Comment'))
        const mappedOnce = renderField.mock.calls.length
        lastFieldProps().onChange('first')

        // A different prop, so this is a real second mapping pass rather than a bail-out.
        rerender(element('Comment (optional)'))
        expect(renderField.mock.calls.length).toBeGreaterThan(mappedOnce)
        lastFieldProps().onChange('second')

        jest.runOnlyPendingTimers()
        expect(instance.submit).toHaveBeenCalledTimes(1)
    })

    describe('the handlers autoSubmit and removable add, kept per document', () => {
        const clearing = (extra = {}) => ({ view: FIELD.TYPE.INPUT, name: 'comment', removable: true, autoSubmit: { delay: 0 }, ...extra })
        /** The field's `onChange` and `onClickIcon`, one render of its document later. */
        const handlersOf = props => {
            const { unmount } = renderMapped(props)
            const { onChange, onClickIcon } = lastFieldProps()
            unmount()
            return { onChange, onClickIcon }
        }

        it('are the same functions while everything they call stays the same', () => {
            const base = { instance: baseInstance(), form: { change: () => {} }, onChange: () => {} }
            const [first, second] = [handlersOf(clearing(base)), handlersOf(clearing(base))]
            expect([second.onChange === first.onChange, second.onClickIcon === first.onClickIcon]).toEqual([true, true])
        })

        it('are made again when something they call changes, and only those that call it', () => {
            // [onChange kept, onClickIcon kept] when one thing changes, each on a document of its own.
            const keptAfter = change => {
                const base = { instance: baseInstance(), form: { change: () => {} }, onChange: () => {} }
                const kept = handlersOf(clearing(base))
                const changed = handlersOf(clearing({ ...base, ...change }))
                return [changed.onChange === kept.onChange, changed.onClickIcon === kept.onClickIcon]
            }
            expect({
                onChange: keptAfter({ onChange: () => {} }),
                onRemove: keptAfter({ onRemove: () => {} }),
                onClickIcon: keptAfter({ onClickIcon: () => {} }),
                form: keptAfter({ form: { change: () => {} } }),
            }).toEqual({
                onChange: [false, false],
                onRemove: [true, false],
                onClickIcon: [true, false],
                form: [true, false],
            })
        })

        it('are made anew on each render for a field without a name', () => {
            const nameless = clearing({ instance: baseInstance(), name: undefined })
            const [first, second] = [handlersOf(nameless), handlersOf(nameless)]
            expect([second.onChange === first.onChange, second.onClickIcon === first.onClickIcon]).toEqual([false, false])
        })

        it('keeps a bounded number of handlers for one document', () => {
            const instance = baseInstance()
            const first = handlersOf(clearing({ instance, name: 'field 0' }))
            // Two handlers a field, for more fields than one document keeps handlers for.
            for (let i = 1; i < 600; i++) handlersOf(clearing({ instance, name: `field ${i}` }))
            expect(handlersOf(clearing({ instance, name: 'field 0' })).onClickIcon).not.toBe(first.onClickIcon)
        })
    })

    it('adds number bounds without losing the existing validator or readonly state', () => {
        const validate = jest.fn(value => value === 5 ? 'Reserved value' : undefined)
        renderMapped({
            view: FIELD.TYPE.INPUT,
            name: 'quantity',
            type: 'number',
            min: 1,
            max: 10,
            validate,
            data: { readonly: true, disabled: true },
        })

        const field = lastFieldProps()
        expect(field.readonly).toBe(true)
        expect(field.disabled).toBe(true)
        expect(field.validate(0)).toBe('Must be minimum 1')
        expect(field.validate(11)).toBe('Must be maximum 10')
        expect(field.validate(5)).toBe('Reserved value')
        expect(field.validate(6)).toBe(OK)
    })

    describe('the validator a number field\'s bounds add, kept per document', () => {
        const bounded = (extra = {}) => ({ view: FIELD.TYPE.INPUT, name: 'quantity', type: 'number', min: 1, max: 10, ...extra })
        /** The `validate` the field is handed, one render of its document later. */
        const validateOf = props => {
            const { unmount } = renderMapped(props)
            const { validate } = lastFieldProps()
            unmount()
            return validate
        }

        it('is one function while the bounds and the field\'s own validate stay the same', () => {
            const instance = baseInstance()
            const own = value => value === 5 ? 'Reserved value' : undefined
            expect(validateOf(bounded({ instance, validate: own }))).toBe(validateOf(bounded({ instance, validate: own })))
            expect(validateOf(bounded({ instance }))).toBe(validateOf(bounded({ instance })))
        })

        it('is another for other bounds, another own validate, or another document', () => {
            const instance = baseInstance()
            const kept = validateOf(bounded({ instance }))
            const others = [
                validateOf(bounded({ instance, max: 20 })),
                validateOf(bounded({ instance, min: '1' })),
                validateOf(bounded({ instance, validate: () => undefined })),
                validateOf(bounded({ instance: baseInstance() })),
            ]
            expect(others.some(validate => validate === kept)).toBe(false)
        })

        it('is made anew on each render for a bound a key cannot tell apart, or an own validate that is not a function', () => {
            const instance = baseInstance()
            const objectBound = bounded({ instance, min: { valueOf: () => 1 } })
            const ownNotAFunction = bounded({ instance, validate: { rule: 'reserved' } })
            const [first, second] = [validateOf(objectBound), validateOf(objectBound)]
            const [third, fourth] = [validateOf(ownNotAFunction), validateOf(ownNotAFunction)]
            expect([first === second, third === fourth]).toEqual([false, false])
        })

        it('keeps a bounded number of bound sets for one document', () => {
            const instance = baseInstance()
            const first = validateOf(bounded({ instance, max: 0 }))
            // More sets of bounds than one document keeps.
            for (let max = 1; max < 200; max++) validateOf(bounded({ instance, max }))
            expect(validateOf(bounded({ instance, max: 0 }))).not.toBe(first)
        })
    })

    it('builds grouped table headers and matrix rows', () => {
        renderMapped({
            view: FIELD.TYPE.TABLE,
            name: 'rows',
            _data: [
                { period: 'Jan', region: 'EU', value: 1 },
                { period: 'Jan', region: 'US', value: 2 },
                { period: 'Feb', region: 'EU', value: 3 },
            ],
            headers: [{ id: 'value', label: 'Value' }],
            group: {
                by: {
                    id: 'region',
                    label: { EU: 'Europe', US: 'United States' },
                    renderLabel: label => `Region: ${label}`,
                },
                header: { id: 'period', label: 'Period' },
            },
        })

        const table = lastTableProps()
        expect(table.headers.map(({ id }) => id)).toEqual(['period', 'value_EU', 'value_US'])
        expect(table.extraHeaders[0].map(({ label }) => label)).toEqual([
            '',
            'Region: Europe',
            'Region: United States',
        ])
        expect(table.items).toEqual([
            { period: 'Jan', value_EU: 1, value_US: 2 },
            { period: 'Feb', value_EU: 3 },
        ])
    })

    // These were reported through `popup.setPopupState`, read off a `popup` key the real context never
    // had: only this suite's provider supplied one, so in a document they threw a TypeError instead.
    // They are thrown now, both in one message, which a document's error boundary renders
    // (`mapper.table-group-misconfig.test.js`).
    it('reports both required grouped-table configuration errors', () => {
        const error = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            expect(() => renderMapped({
                view: FIELD.TYPE.TABLE,
                name: 'rows',
                _data: [],
                group: { by: {}, header: null },
            })).toThrow(/group\.by must have 'id'.*group\.header must have 'id'/s)
        } finally {
            error.mockRestore()
        }
    })

    it('filters nested rows, resolves extra items, and computes sticky column offsets', () => {
        renderMapped({
            view: FIELD.TYPE.TABLE,
            name: 'children',
            data: {
                shared: { label: 'Summary', amount: 42 },
            },
            _data: [
                { id: 'keep', parentId: 'A' },
                { id: 'drop', parentId: 'B' },
            ],
            parentItem: { id: 'A' },
            filterItems: [{ parentId: 'id' }],
            extraItems: [
                { label: { name: 'shared.label' } },
                { amount: { name: 'shared.amount', render: jest.fn() } },
                { custom: { view: FIELD.TYPE.TEXT, children: 'Custom' } },
            ],
            colGroup: [
                { isFixed: true, style: { minWidth: '50px' } },
                { isFixed: true, style: { minWidth: '25px' } },
                { isFixed: false, style: { minWidth: '100px' } },
            ],
        })

        const table = lastTableProps()
        expect(table.items[0]).toEqual({ id: 'keep', parentId: 'A' })
        expect(table.items[1]).toEqual({ label: 'Summary' })
        expect(table.items[2].amount.data).toBe(42)
        expect(table.items[3].custom).toEqual(expect.any(Function))
        expect(table.additionalCellsStyles).toEqual([
            { left: '0px', position: 'sticky', zIndex: 1 },
            { left: '50px', position: 'sticky', zIndex: 1 },
        ])
    })

    it('registers static and interpolated popup definitions separately', () => {
        const instance = baseInstance()

        const { rerender } = renderMapped({
            view: FIELD.TYPE.POPUP,
            id: 'details',
            items: [{ view: FIELD.TYPE.TEXT, children: 'Static content' }],
            instance,
        })
        expect(React.isValidElement(instance.popupById.details.content)).toBe(true)

        rerender(withProviders(
            <Render.Component
                view={FIELD.TYPE.POPUP}
                id="details-{state.row}"
                items={[{ view: FIELD.TYPE.TEXT, children: 'Template content' }]}
                data={{}}
                instance={instance}
                form={{ change: jest.fn() }}
            />
        ))

        expect(instance.popupTemplates['details-{state.row}']).toEqual(expect.objectContaining({
            items: [{ view: FIELD.TYPE.TEXT, children: 'Template content' }],
            instance,
        }))
    })

    it('lets live raw form data override initial data in showIf', () => {
        const instance = {
            ...baseInstance(),
            getRawFormsData: () => ({ featureEnabled: false }),
        }
        const { container } = renderMapped({
            view: FIELD.TYPE.TEXT,
            children: 'Sensitive section',
            data: { featureEnabled: true },
            showIf: { name: 'featureEnabled' },
            instance,
        })

        expect(container).toBeEmptyDOMElement()
    })
})
