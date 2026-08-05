import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../../modules/form/utils'
import Render from '../../../ui-render'
import { FIELD } from '../../../modules/variables'
import { OK } from '../../../components/inputs/validationRules'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../../contexts'
import { renderField } from '../components/renders'
import TableView from '../components/TableView'
import '../mapper'

jest.mock('../components/renders', () => {
    const { Active } = jest.requireActual('../../../utils')
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

const popup = {
    setPopupState: jest.fn(),
}

const withProviders = ui => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={{ ...initialAppState, popup }}>
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

    it('reports both required grouped-table configuration errors', () => {
        renderMapped({
            view: FIELD.TYPE.TABLE,
            name: 'rows',
            _data: [],
            group: { by: {}, header: null },
        })

        expect(popup.setPopupState).toHaveBeenCalledTimes(2)
        expect(popup.setPopupState.mock.calls[0][0].content).toContain("group.by must have 'id'")
        expect(popup.setPopupState.mock.calls[1][0].content).toContain("group.header must have 'id'")
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
